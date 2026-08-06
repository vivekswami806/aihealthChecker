import userRepository from '../repositories/userRepository.js';
import reportRepository from '../repositories/reportRepository.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import bcrypt from 'bcryptjs';

export class UserService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateProfile(userId, updateData) {
    // Don't allow updating sensitive fields
    delete updateData.password_hash;
    delete updateData.role;
    delete updateData.is_verified;
    delete updateData.is_active;

    const user = await userRepository.update(userId, updateData);
    logger.info(`Profile updated for user: ${userId}`);

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      profile_image: user.profile_image,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  } 

  async deleteAccount(userId) {
    // Delete all user's data
    if (!userId) {
      throw new Error('User ID is required');
    }
    const deletedUser = await userRepository.delete(userId);
    return {
      id: deletedUser.id,
      email: deletedUser.email,
    };
  }

  async getDashboard(userId) {
    const [profile, reportStats, recentReports] = await Promise.all([
      userRepository.findById(userId),
      reportRepository.getReportStatistics(userId),
      reportRepository.getRecentReports(userId, 30, 5),
    ]);

    return {
      profile,
      reportStats,
      recentReports,
    };
  }

  async getUserActivity(userId, skip = 0, take = 10) {
    const [reports, total] = await reportRepository.findByUserId(
      userId,
      skip,
      take
    );

    return {
      activity: reports.map((report) => ({
        id: report.id,
        type: 'report_upload',
        title: report.report_name,
        timestamp: report.upload_date,
        status: report.report_status,
      })),
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
    };
  }

  async getAllUsers(skip = 0, take = 10) {
    return userRepository.getAllUsers(skip, take);
  }

  async getUserAnalytics(userId) {
    const [reportStats, recentReports] = await Promise.all([
      reportRepository.getReportStatistics(userId),
      reportRepository.getRecentReports(userId, 365, 10),
    ]);

    return {
      reportStats,
      recentReports,
      totalReportsThisYear: recentReports.length,
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
  
    if (!user) {
      throw new AppError('User not found', 404);
    }
  
    // verify current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
  
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }
  
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
      },
    });
  
    return { success: true };
  }
}

export default new UserService();