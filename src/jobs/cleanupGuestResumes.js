import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';
import { deleteS3Object } from '../utils/s3Uploader.js';

/**
 * Cleanup expired guest resumes
 * Runs daily at 2 AM to delete guest resumes that have expired
 */
export const scheduleGuestCleanup = () => {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Starting cleanup of expired guest resumes');

      // Find expired guest resumes
      const expiredResumes = await prisma.resume.findMany({
        where: {
          user_id: null,
          expires_at: { lt: new Date() }
        },
        select: {
          id: true,
          resume_fileUrl: true,
          optimized_resumeUrl: true,
        }
      });

      if (expiredResumes.length === 0) {
        logger.info('No expired guest resumes to clean up');
        return;
      }

      logger.info(`Found ${expiredResumes.length} expired guest resumes to delete`);

      // Collect S3 URLs to delete
      const s3UrlsToDelete = [];
      expiredResumes.forEach(resume => {
        if (resume.resume_fileUrl) {
          s3UrlsToDelete.push(resume.resume_fileUrl);
        }
        if (resume.optimized_resumeUrl) {
          s3UrlsToDelete.push(resume.optimized_resumeUrl);
        }
      });

      // Delete from database (cascade will delete associated jobs)
      const deleteResult = await prisma.resume.deleteMany({
        where: {
          user_id: null,
          expires_at: { lt: new Date() }
        }
      });

      logger.info(`✅ Deleted ${deleteResult.count} expired guest resumes from database`);

      // Delete S3 files in background
      if (s3UrlsToDelete.length > 0) {
        Promise.all(s3UrlsToDelete.map(url => deleteS3Object(url)))
          .then(() => {
            logger.info(`✅ Deleted ${s3UrlsToDelete.length} S3 files from expired guest resumes`);
          })
          .catch(error => {
            logger.error('Failed to delete S3 files from expired guest resumes', {
              error: error.message
            });
          });
      }

    } catch (error) {
      logger.error('❌ Guest resume cleanup job failed', {
        error: error.message,
        stack: error.stack
      });
    }
  });

  logger.info('📅 Guest resume cleanup job scheduled (daily at 2 AM)');
};
