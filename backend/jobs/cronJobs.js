import schedule from 'node-schedule';
import logger from '../config/logger.js';
import prisma from '../config/database.js';
import notificationService from '../services/notificationServices.js';

export class CronJobs {
  static initialize() {
    logger.info('Initializing cron jobs...');

    // Daily health reminders at 9 AM
    schedule.scheduleJob('0 9 * * *', async () => {
      try {
        logger.info('Running daily health reminder job...');
        const users = await prisma.user.findMany({
          select: { id: true },
        });

        for (const user of users) {
          await notificationService.sendHealthReminder(user.id);
        }
      } catch (error) {
        logger.error('Health reminder job error:', error);
      }
    });

    // Weekly subscription check (every Monday at 10 AM)
    schedule.scheduleJob('0 10 ? * MON', async () => {
      try {
        logger.info('Running subscription expiry check...');
        const expiringSubscriptions = await prisma.subscription.findMany({
          where: {
            expiry_date: {
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              gte: new Date(), // Not yet expired
            },
            payment_status: 'active',
          },
        });

        for (const sub of expiringSubscriptions) {
          await notificationService.sendSubscriptionExpiry(sub.user_id);
        }
      } catch (error) {
        logger.error('Subscription check job error:', error);
      }
    });

    // Monthly health summary (1st of month at 8 AM)
    schedule.scheduleJob('0 8 1 * *', async () => {
      try {
        logger.info('Running monthly health summary job...');
        // Generate and send health summaries
        // Implementation based on your requirements
      } catch (error) {
        logger.error('Monthly summary job error:', error);
      }
    });

    // Clean up old notifications (daily at 2 AM)
    schedule.scheduleJob('0 2 * * *', async () => {
      try {
        logger.info('Running notification cleanup...');
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const result = await prisma.notification.deleteMany({
          where: {
            created_at: { lt: thirtyDaysAgo },
            is_read: true,
          },
        });

        logger.info(`Deleted ${result.count} old notifications`);
      } catch (error) {
        logger.error('Notification cleanup error:', error);
      }
    });

    // Database backup check (daily at 3 AM)
    schedule.scheduleJob('0 3 * * *', async () => {
      try {
        logger.info('Running database backup check...');
        // Implement your backup logic here
      } catch (error) {
        logger.error('Database backup error:', error);
      }
    });

    logger.info('Cron jobs initialized successfully');
  }

  static stopAll() {
    schedule.gracefulShutdown();
    logger.info('All cron jobs stopped');
  }
}

export default CronJobs;