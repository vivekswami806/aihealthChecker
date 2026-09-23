import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../config/index.js';
import logger from '../config/logger.js';

const COLLECTION = config.qdrant?.collection || 'medical_report_chunks';
const VECTOR_SIZE = config.qdrant?.vectorSize || 768;
 
class QdrantService {
  constructor() {
    this.client = null;
    this.ready = false;
    this.enabled = Boolean(config.qdrant?.url);
  }

  async init() {
    if (!this.enabled) {
      logger.warn('Qdrant not configured — RAG will use PostgreSQL cosine fallback');
      return false;
    }

    try {
      this.client = new QdrantClient({
        url: config.qdrant.url,
        apiKey: config.qdrant.apiKey || undefined,
      });

      await this.ensureCollection();
      this.ready = true;
      logger.info('Qdrant vector DB ready', { collection: COLLECTION, url: config.qdrant.url });
      return true;
    } catch (error) {
      logger.error('Qdrant init failed — falling back to PostgreSQL', {
        message: error.message,
      });
      this.ready = false;
      return false;
    }
  }

  isReady() {
    return this.ready && this.client;
  }

  async ensureCollection() {
    const collections = await this.client.getCollections();
    const exists = collections.collections?.some((c) => c.name === COLLECTION);

    if (!exists) {
      await this.client.createCollection(COLLECTION, {
        vectors: {
          size: VECTOR_SIZE,
          distance: 'Cosine',
        },
      });

      await this.client.createPayloadIndex(COLLECTION, {
        field_name: 'userId',
        field_schema: 'keyword',
      });

      await this.client.createPayloadIndex(COLLECTION, {
        field_name: 'reportId',
        field_schema: 'keyword',
      });

      await this.client.createPayloadIndex(COLLECTION, {
        field_name: 'source',
        field_schema: 'keyword',
      });

      logger.info('Created Qdrant collection', { collection: COLLECTION });
    }
  }

  /**
   * Normalize embedding length to VECTOR_SIZE (Gemini can return 768 or 3072).
   */
  normalizeVector(embedding) {
    if (!embedding?.length) return null;

    if (embedding.length === VECTOR_SIZE) return embedding;

    if (embedding.length > VECTOR_SIZE) {
      return embedding.slice(0, VECTOR_SIZE);
    }

    // Pad if shorter (unlikely)
    return [...embedding, ...new Array(VECTOR_SIZE - embedding.length).fill(0)];
  }

  async upsertChunks(points) {
    if (!this.isReady() || !points.length) return false;

    const qdrantPoints = points
      .map((p) => {
        const vector = this.normalizeVector(p.embedding);
        if (!vector) return null;

        return {
          id: p.id,
          vector,
          payload: {
            reportId: p.reportId,
            userId: p.userId,
            chunkIndex: p.chunkIndex,
            content: p.content,
            source: p.source || 'document',
            topic: p.topic || null,
            tokenCount: p.tokenCount || null,
          },
        };
      })
      .filter(Boolean);

    if (!qdrantPoints.length) return false;

    await this.client.upsert(COLLECTION, {
      wait: true,
      points: qdrantPoints,
    });

    return true;
  }

  async deleteByReportId(reportId) {
    if (!this.isReady()) return;

    try {
      await this.client.delete(COLLECTION, {
        wait: true,
        filter: {
          must: [{ key: 'reportId', match: { value: reportId } }],
        },
      });
    } catch (error) {
      logger.warn('Qdrant delete by reportId failed', { reportId, message: error.message });
    }
  }

  async search({ queryEmbedding, userId, reportId, topK = 6, scoreThreshold = 0.25 }) {
    if (!this.isReady()) return null;

    const vector = this.normalizeVector(queryEmbedding);
    if (!vector) return null;

    const filter = {
      should: [
        {
          must: [
            { key: 'userId', match: { value: userId } },
          ],
        },
        {
          must: [{ key: 'source', match: { value: 'knowledge_base' } }],
        },
      ],
    };

    // Prefer current report + same user + knowledge base
    const result = await this.client.search(COLLECTION, {
      vector,
      limit: topK,
      score_threshold: scoreThreshold,
      with_payload: true,
      filter,
    });

    // Boost current report chunks by re-ranking slightly
    return result.map((hit) => ({
      source: hit.payload?.source || 'document',
      reportId: hit.payload?.reportId,
      topic: hit.payload?.topic,
      content: hit.payload?.content,
      score:
        hit.payload?.reportId === reportId
          ? (hit.score || 0) + 0.05
          : hit.score || 0,
    }));
  }

  async upsertKnowledgeBase(entries) {
    if (!this.isReady() || !entries.length) return;

    const points = entries
      .map((entry) => {
        const vector = this.normalizeVector(entry.embedding);
        if (!vector) return null;

        // Stable UUID-like id from knowledge id string hash
        const id = this.stringToUuid(entry.id);

        return {
          id,
          vector,
          payload: {
            reportId: 'knowledge_base',
            userId: 'system',
            chunkIndex: 0,
            content: entry.content,
            source: 'knowledge_base',
            topic: entry.topic,
          },
        };
      })
      .filter(Boolean);

    if (points.length) {
      await this.client.upsert(COLLECTION, { wait: true, points });
    }
  }

  stringToUuid(str) {
    // Deterministic UUID v5-like from string (simple hash for Qdrant point IDs)
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `00000000-0000-4000-8000-${hex.padStart(12, '0').slice(0, 12)}`;
  }
}

const qdrantService = new QdrantService();
export default qdrantService;
