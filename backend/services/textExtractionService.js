import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../config/logger.js';
import { config } from '../config/index.js';
import fileUploadService from './fileUploadServices.js';

const apiKey = config.googleapi.apiKey || config.gemini.apiKey;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function detectFileKind(mimeType = '', fileName = '', fileUrl = '') {
  const type = String(mimeType).toLowerCase();
  const name = String(fileName).toLowerCase();
  const url = String(fileUrl).toLowerCase();

  if (type.includes('pdf') || name.endsWith('.pdf') || url.includes('.pdf')) {
    return 'pdf';
  }

  if (
    type.includes('word') ||
    type.includes('docx') ||
    type.includes('msword') ||
    name.endsWith('.docx') ||
    name.endsWith('.doc') ||
    url.includes('.docx')
  ) {
    return 'docx';
  }

  if (
    type.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif|bmp)(\?|$)/i.test(name) ||
    /\.(jpg|jpeg|png|webp|gif|bmp)(\?|$)/i.test(url)
  ) {
    return 'image';
  }

  return 'unknown';
}

export class TextExtractionService {
  async extractFromBuffer(buffer, mimeType = '', fileName = '') {
    const kind = detectFileKind(mimeType, fileName);

    logger.info('Extracting text from buffer', { mimeType, fileName, kind });

    let text = '';

    switch (kind) {
      case 'pdf':
        text = await this.extractFromPdf(buffer);
        break;
      case 'docx':
        text = await this.extractFromDocx(buffer);
        break;
      case 'image':
        text = await this.extractFromImage(buffer);
        break;
      default:
        text = this.extractPlainText(buffer);
    }

    // Fallback: Gemini multimodal OCR for scanned PDFs / weak OCR
    if (!this.isUsableText(text) && (kind === 'pdf' || kind === 'image')) {
      logger.info('Local extraction weak — trying Gemini OCR fallback', { kind, fileName });
      const geminiText = await this.extractWithGeminiVision(buffer, mimeType, kind);
      if (this.isUsableText(geminiText)) {
        return geminiText;
      }
    }

    return text;
  }

  async extractFromUrl(fileUrl, reportType = '', fileName = '') {
    logger.info('Extracting document text from URL', { fileUrl, reportType, fileName });

    const buffer = await fileUploadService.downloadFileBuffer(fileUrl);
    return this.extractFromBuffer(buffer, reportType, fileName || fileUrl);
  }

  async extractFromPdf(buffer) {
    const data = await pdfParse(buffer);
    const text = (data.text || '').trim();

    if (text.length >= 20) {
      return text;
    }

    logger.warn('PDF has little or no text layer, may be a scanned document');
    return text || 'No readable text found in PDF document.';
  }

  async extractFromDocx(buffer) {
    const result = await mammoth.extractRawText({ buffer });
    const text = (result.value || '').trim();
    return text || 'No readable text found in Word document.';
  }

  async extractFromImage(buffer) {
    const result = await Tesseract.recognize(buffer, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          logger.debug('OCR progress', { progress: m.progress });
        }
      },
    });

    const text = (result.data.text || '').trim();
    return text || 'No readable text found in image via OCR.';
  }

  /**
   * Gemini vision OCR for scanned PDFs and hard-to-read images.
   * Extracts TEXT only — does not run medical analysis.
   */
  async extractWithGeminiVision(buffer, mimeType = '', kind = 'image') {
    if (!genAI) {
      return 'Unable to extract text. Gemini OCR is not configured.';
    }

    try {
      const mime =
        kind === 'pdf'
          ? 'application/pdf'
          : mimeType || 'image/jpeg';

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: mime,
            data: buffer.toString('base64'),
          },
        },
        {
          text: `Extract ALL readable text from this medical document exactly as written.
Include lab names, values, units, reference ranges, patient info, and doctor notes.
Do NOT summarize. Do NOT interpret. Return plain text only.`,
        },
      ]);

      const text = (result.response.text() || '').trim();
      return text || 'No readable text found in image via OCR.';
    } catch (error) {
      logger.error('Gemini OCR fallback failed', { message: error.message });
      return 'Unable to extract text from this file type.';
    }
  }

  extractPlainText(buffer) {
    const text = buffer.toString('utf8').trim();
    if (text && /[\x20-\x7E\n\r\t]/.test(text)) {
      return text;
    }
    return 'Unable to extract text from this file type.';
  }

  isUsableText(text) {
    if (!text) return false;

    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (cleaned.length < 20) return false;

    const failurePhrases = [
      'Unable to extract text',
      'No readable text found',
      'Unable to extract text from this file type',
    ];

    return !failurePhrases.some((phrase) => cleaned.includes(phrase));
  }

  getSupportedFormatsMessage() {
    return 'Supported formats: PDF, DOCX, JPG, JPEG, PNG, WEBP';
  }
}

export default new TextExtractionService();
