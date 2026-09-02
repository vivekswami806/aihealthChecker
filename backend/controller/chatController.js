import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import chatService from '../services/chatServices.js';

export const chatController = {
  listConversations: asyncHandler(async (req, res) => {
    const conversations = await chatService.listConversations(req.user.id);
    return ApiResponse.success(res, conversations, 'Conversations fetched');
  }),

  getConversation: asyncHandler(async (req, res) => {
    const conversation = await chatService.getConversation(
      req.user.id,
      req.params.id
    );
    return ApiResponse.success(res, conversation, 'Conversation fetched');
  }),

  createConversation: asyncHandler(async (req, res) => {
    const conversation = await chatService.createConversation(
      req.user.id,
      req.body.title
    );
    return ApiResponse.success(res, conversation, 'Conversation created', 201);
  }),

  sendMessage: asyncHandler(async (req, res) => {
    const { message, conversationId } = req.body;
    const result = await chatService.sendMessage(
      req.user.id,
      message,
      conversationId
    );
    return ApiResponse.success(res, result, 'Message sent', 201);
  }),

  deleteConversation: asyncHandler(async (req, res) => {
    const result = await chatService.deleteConversation(
      req.user.id,
      req.params.id
    );
    return ApiResponse.success(res, result, 'Conversation deleted');
  }),
};

export default chatController;
