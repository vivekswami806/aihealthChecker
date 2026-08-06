import express from 'express';
import cors from 'cors'
import 'express-async-errors';
import passport from 'passport';
import { config } from './config/index.js';
import logger from './config/logger.js';
import { connectDB } from './config/database.js';
import { securityMiddleware, rateLimiter } from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
// import healthRoutes from './routes/healthRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import './config/passport.js';

const app = express();

// Database connection
await connectDB();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(securityMiddleware);
app.use(
  cors({
    origin: 'http://localhost:3030',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Passport middleware
app.use(passport.initialize());
// app.use(passport.session());

// Rate limiting
app.use(rateLimiter());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
// app.use('/api/health', healthRoutes);
app.use('/api/notifications', notificationRoutes);

// Welcome route
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Medical Report Analysis API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.NODE_ENV}`);
  logger.info(`API URL: ${config.API_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;