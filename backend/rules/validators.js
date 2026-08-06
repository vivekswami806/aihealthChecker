import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/index.js';

const corsOptions = {
  origin: config.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
};

// Simple in-memory rate limiter (use Redis for production)
const requestCounts = new Map();

export const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();

    if (!requestCounts.has(key)) {
      requestCounts.set(key, []);
    }

    const requests = requestCounts.get(key);
    const recentRequests = requests.filter((time) => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000),
      });
    }

    recentRequests.push(now);
    requestCounts.set(key, recentRequests);
    next();
  };
};

// Specific rate limiter for auth endpoints
export const authRateLimiter = rateLimiter(15 * 60 * 1000, 5);

// Export security middleware setup
export const securityMiddleware = [
  helmet(helmetOptions),
  cors(corsOptions),
];

export default {
  rateLimiter,
  authRateLimiter,
  securityMiddleware,
};