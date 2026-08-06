import { Router } from 'express';
import passport from 'passport';
import authController from '../controller/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/security.js';
import { registerValidator, loginValidator } from '../limiting/validators.js';
import config from '../config/index.js';

const router = Router();

// Public routes
router.post('/register', authRateLimiter, registerValidator, authController.register);
router.post('/login', authRateLimiter, loginValidator, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {  session: false, scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect:  `${config.FRONTEND_URL}/auth/login`}),
  authController.googleCallback
);

// GitHub OAuth routes
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  authController.githubCallback
);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all-devices', authenticate, authController.logoutAllDevices);


export default router;