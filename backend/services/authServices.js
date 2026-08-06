import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import userRepository from '../repositories/userRepository.js';
import logger from '../config/logger.js';
import { AppError } from '../middleware/errorHandler.js';

export class AuthService {
  generateAccessToken(userId) {
    return jwt.sign({ id: userId }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRATION,
    });
  }

  generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRATION,
    });
  }

  verifyToken(token, isRefresh = false) {
    const secret = isRefresh ? config.JWT_REFRESH_SECRET : config.JWT_SECRET;
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  async register(email, password, fullName) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }
   let user = await userRepository.create({
      email,
      password,
      fullName,
      authProvider: 'LOCAL',
      isVerified: false
    });

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Create session
    await userRepository.createSession(
      user.id,
      refreshToken,
      'Web Browser',
      null
    );

    logger.info(`User registered: ${email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await userRepository.verifyPassword(user, password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Create session
    await userRepository.createSession(
      user.id,
      refreshToken,
      'Web Browser',
      null
    );

    logger.info(`User logged in: ${email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken) {
    const decoded = this.verifyToken(refreshToken, true);

    // Verify session exists
    const session = await userRepository.findSession(
      decoded.id,
      refreshToken
    );
    if (!session) {
      throw new AppError('Invalid session', 401);
    }

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const newAccessToken = this.generateAccessToken(user.id);

    return {
      accessToken: newAccessToken,
      user,
    };
  }

  async logout(userId, sessionId = null) {
    if (sessionId) {
      await userRepository.deleteSession(sessionId);
    } else {
      // Logout from all devices
      await userRepository.deleteAllUserSessions(userId);
    }

    logger.info(`User logged out: ${userId}`);
    return { message: 'Logged out successfully' };
  }

  async handleGoogleAuth(profile) {
    const email = profile.email;
    if (!email) {
      throw new AppError('Google account email not found', 400);
    }
  
    let user = await userRepository.findByGoogleId(profile.id);
  
    if (!user) {
      user = await userRepository.findByEmail(profile.email);
  
      if (!user) {
        user = await userRepository.create({
          email: profile.email,
          fullName: profile.displayName,
          authProvider: 'GOOGLE',
          isVerified: true,
        });
  
        user = await userRepository.update(user.id, {
          googleId: profile.id,
        });
      } else {
        user = await userRepository.update(user.id, {
          googleId: profile.id,
          authProvider: 'GOOGLE',
          isVerified: true,
        });
      }
    }
  
    await userRepository.updateLastLogin(user.id);
  
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
  
    await userRepository.createSession(
      user.id,
      refreshToken,
      'Google Login',
      null
    );
  console.log(  user,
    accessToken,
    refreshToken,);
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async handleGithubAuth(profile) {
    let user = await userRepository.findByGithubId(profile.id);
  
    if (!user) {
      const email =
        profile.emails?.[0]?.value ||
        `${profile.username}@github.local`;
  
      user = await userRepository.findByEmail(email);
  
      if (!user) {
        user = await userRepository.create({
          email,
          fullName: profile.displayName || profile.username,
          authProvider: 'GITHUB',
          isVerified: true,
        });
  
        user = await userRepository.update(user.id, {
          githubId: profile.id,
        });
      } else {
        user = await userRepository.update(user.id, {
          githubId: profile.id,
          authProvider: 'GITHUB',
          isVerified: true,
        });
      }
    }
  
    await userRepository.updateLastLogin(user.id);
  
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
  
    await userRepository.createSession(
      user.id,
      refreshToken,
      'GitHub Login',
      null
    );
  
    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}

export default new AuthService();