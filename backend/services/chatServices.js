import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

const apiKey = config.googleapi.apiKey || config.gemini.apiKey;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export class ChatService {
  async listConversations(userId) {
    return prisma.chatConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: { select: { messages: true } },
      },
    });
  }

  async getConversation(userId, conversationId) {
    const conversation = await prisma.chatConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    return conversation;
  }

  async createConversation(userId, title = 'New chat') {
    return prisma.chatConversation.create({
      data: { userId, title },
    });
  }

  async buildMedicalContext(userId) {
    const [diseases, recentReports, latestScore] = await Promise.all([
      prisma.diseaseHistory.findMany({
        where: { userId },
        orderBy: { lastDetected: 'desc' },
        take: 10,
      }),
      prisma.medicalReport.findMany({
        where: { userId },
        include: { aiAnalysis: true },
        orderBy: { uploadDate: 'desc' },
        take: 5,
      }),
      prisma.healthScore.findFirst({
        where: { userId },
        orderBy: { calculatedAt: 'desc' },
      }),
    ]);

    return {
      diseases,
      recentReports: recentReports.map((r) => ({
        name: r.reportName,
        date: r.uploadDate,
        disease: r.aiAnalysis?.diseaseDetected,
        severity: r.aiAnalysis?.severity,
        riskScore: r.aiAnalysis?.riskScore,
        summary: r.aiAnalysis?.aiSummary,
      })),
      latestScore,
    };
  }

  async sendMessage(userId, message, conversationId = null) {
    if (!genAI) {
      throw new AppError('AI assistant is not configured (missing Gemini API key)', 500);
    }

    if (!message?.trim()) {
      throw new AppError('Message is required', 400);
    }

    let conversation;
    if (conversationId) {
      conversation = await this.getConversation(userId, conversationId);
    } else {
      conversation = await this.createConversation(
        userId,
        message.trim().slice(0, 60)
      );
    }

    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message.trim(),
      },
    });

    const context = await this.buildMedicalContext(userId);
    const history = await prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const systemPrompt = `You are a helpful AI health assistant for a medical report analysis app.
Use the user's medical context when relevant. Be clear, empathetic, and practical.
Always remind users this is not a substitute for professional medical advice.
If symptoms sound urgent, advise seeking emergency care.

User medical context (JSON):
${JSON.stringify(context, null, 2)}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [
            {
              text: 'Understood. I will help with health questions using the provided medical context and include appropriate medical disclaimers.',
            },
          ],
        },
        ...history.slice(0, -1).map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      ],
    });

    let replyText;
    try {
      const result = await chat.sendMessage(message.trim());
      replyText = result.response.text();
    } catch (error) {
      logger.error('Chat AI error', { message: error.message });
      throw new AppError('Failed to get AI response', 500);
    }

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: replyText,
      },
    });

    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: {
        updatedAt: new Date(),
        title:
          conversation.title === 'New chat'
            ? message.trim().slice(0, 60)
            : conversation.title,
      },
    });

    return {
      conversationId: conversation.id,
      message: assistantMessage,
    };
  }

  async deleteConversation(userId, conversationId) {
    const conversation = await prisma.chatConversation.findFirst({
      where: { id: conversationId, userId },
    });
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }
    await prisma.chatMessage.deleteMany({ where: { conversationId } });
    await prisma.chatConversation.delete({ where: { id: conversationId } });
    return { success: true };
  }
}

export default new ChatService();
