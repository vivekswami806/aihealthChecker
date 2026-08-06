import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from './errorHandler.js';
import prisma from '../config/database.js';
import logger from '../config/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw new AppError('User not found or inactive', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    next(new AppError(error.message || 'Unauthorized', 401));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    next();
  };
};

export default authenticate;