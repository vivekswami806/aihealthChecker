import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import logger from '../config/logger.js';
import { MEDICAL_KNOWLEDGE_BASE } from '../data/medicalKnowledgeBase.js';
import qdrantService from './qdrantService.js';

const apiKey = config.googleapi.apiKey || config.gemini.apiKey;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const CHUNK_SIZE = config.rag?.chunkSize || 800;
const CHUNK_OVERLAP = config.rag?.chunkOverlap || 150;
const TOP_K_CHUNKS = config.rag?.topK || 6;
const EMBEDDING_MODEL = config.rag?.embeddingModel || 'gemini-embedding-001';

let knowledgeIndexed = false;

function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class RagService {
  chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    const normalized = String(text || '')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!normalized) return [];

    const chunks = [];
    let start = 0;

    while (start < normalized.length) {
      let end = Math.min(start + chunkSize, normalized.length);

      if (end < normalized.length) {
        const slice = normalized.slice(start, end);
        const lastBreak = Math.max(
          slice.lastIndexOf('\n'),
          slice.lastIndexOf('. '),
          slice.lastIndexOf('; ')
        );

        if (lastBreak > chunkSize * 0.5) {
          end = start + lastBreak + 1;
        }
      }

      const content = normalized.slice(start, end).trim();
      if (content) chunks.push(content);

      if (end >= normalized.length) break;
      start = Math.max(end - overlap, start + 1);
    }

    return chunks;
  }

  async generateEmbedding(text) {
    if (!genAI) {
      throw new Error('Gemini API key is not configured for embeddings');
    }

    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const input = String(text).slice(0, 8000);

    try {
      const result = await model.embedContent({
        content: { parts: [{ text: input }] },
        outputDimensionality: config.qdrant?.vectorSize || 768,
      });
      return result.embedding.values;
    } catch {
      const result = await model.embedContent(input);
      return result.embedding.values;
    }
  }

  async generateEmbeddings(texts) {
    const embeddings = [];
    for (const text of texts) {
      embeddings.push(await this.generateEmbedding(text));
    }
    return embeddings;
  }

  async indexReportDocument(reportId, userId, fullText) {
    await prisma.reportDocumentChunk.deleteMany({ where: { reportId } });
    await qdrantService.deleteByReportId(reportId);

    const chunks = this.chunkText(fullText);
    if (!chunks.length) {
      logger.warn('No chunks created for report', { reportId });
      return [];
    }

    const embeddings = await this.generateEmbeddings(chunks);

    const records = await prisma.$transaction(
      chunks.map((content, index) =>
        prisma.reportDocumentChunk.create({
          data: {
            reportId,
            userId,
            chunkIndex: index,
            content,
            embedding: embeddings[index],
            tokenCount: content.split(/\s+/).length,
          },
        })
      )
    );

    // Store vectors in Qdrant (primary retrieval path)
    const qdrantOk = await qdrantService.upsertChunks(
      records.map((record, index) => ({
        id: record.id,
        reportId,
        userId,
        chunkIndex: index,
        content: record.content,
        embedding: embeddings[index],
        source: 'document',
        tokenCount: record.tokenCount,
      }))
    );

    await this.ensureKnowledgeBaseIndexed();

    logger.info('Indexed report document chunks', {
      reportId,
      chunkCount: records.length,
      vectorDb: qdrantOk ? 'qdrant' : 'postgres-fallback',
    });

    return records;
  }

  async ensureKnowledgeBaseIndexed() {
    if (knowledgeIndexed) return;

    try {
      const entries = await Promise.all(
        MEDICAL_KNOWLEDGE_BASE.map(async (entry) => ({
          ...entry,
          embedding: await this.generateEmbedding(`${entry.topic}: ${entry.content}`),
        }))
      );

      await qdrantService.upsertKnowledgeBase(entries);
      knowledgeIndexed = true;
    } catch (error) {
      logger.warn('Knowledge base indexing skipped', { message: error.message });
    }
  }

  async retrieveRelevantChunks(userId, reportId, queryText, topK = TOP_K_CHUNKS) {
    const queryEmbedding = await this.generateEmbedding(queryText);

    // Primary: Qdrant vector search
    if (qdrantService.isReady()) {
      const hits = await qdrantService.search({
        queryEmbedding,
        userId,
        reportId,
        topK,
      });

      if (hits?.length) {
        return hits.sort((a, b) => b.score - a.score).slice(0, topK);
      }
    }

    // Fallback: PostgreSQL + in-memory cosine
    return this.retrieveFromPostgres(userId, reportId, queryEmbedding, topK);
  }

  async retrieveFromPostgres(userId, reportId, queryEmbedding, topK) {
    const [reportChunks, userChunks] = await Promise.all([
      prisma.reportDocumentChunk.findMany({ where: { reportId } }),
      prisma.reportDocumentChunk.findMany({
        where: { userId, reportId: { not: reportId } },
        orderBy: { createdAt: 'desc' },
        take: 40,
      }),
    ]);

    const scored = [];

    for (const chunk of [...reportChunks, ...userChunks]) {
      scored.push({
        source: 'document',
        reportId: chunk.reportId,
        content: chunk.content,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
      });
    }

    for (const entry of MEDICAL_KNOWLEDGE_BASE) {
      const emb = await this.generateEmbedding(`${entry.topic}: ${entry.content}`);
      scored.push({
        source: 'knowledge_base',
        topic: entry.topic,
        content: entry.content,
        score: cosineSimilarity(queryEmbedding, emb),
      });
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter((item) => item.score > 0.2);
  }

  buildRagContext(retrievedChunks, reportName) {
    if (!retrievedChunks.length) {
      return `Report: ${reportName}\nNo retrieved context available.`;
    }

    const sections = retrievedChunks.map((chunk, index) => {
      const label =
        chunk.source === 'knowledge_base'
          ? `Medical reference (${chunk.topic})`
          : `Report excerpt (report ${chunk.reportId})`;

      return `[Context ${index + 1} - ${label}]\n${chunk.content}`;
    });

    return `Report name: ${reportName}\n\nRetrieved medical context:\n\n${sections.join('\n\n')}`;
  }

  buildAnalysisQuery(reportName, extractedText) {
    const preview = String(extractedText || '').slice(0, 1200);
    return [
      `Analyze this medical report: ${reportName}`,
      'Focus on diagnoses, lab values, symptoms, risk factors, and clinical recommendations.',
      preview,
    ].join('\n\n');
  }
}

export default new RagService();
