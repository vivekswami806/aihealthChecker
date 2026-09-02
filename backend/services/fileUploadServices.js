import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { config } from '../config/index.js';
import logger from '../config/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = config.fileUpload.allowedMimes;
  const fileExt = path.extname(file.originalname).toLowerCase().slice(1);

  if (
    allowedMimes.includes(file.mimetype) &&
    config.fileUpload.allowedExtensions.includes(fileExt)
  ) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type', 400));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: config.fileUpload.maxSize },
  fileFilter,
});

export function extractCloudinaryPublicId(fileUrl) {
  if (!fileUrl) return null;
  try {
    const uploadIndex = fileUrl.indexOf('/upload/');
    if (uploadIndex === -1) return null;
    let pathPart = fileUrl.slice(uploadIndex + '/upload/'.length);
    pathPart = pathPart.replace(/^v\d+\//, '');
    pathPart = pathPart.split('?')[0];
    return pathPart.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
}

export class FileUploadService {
  async uploadToCloudinary(file, userId) {
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey) {
      throw new AppError('Cloudinary is not configured', 500);
    }

    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          {
            folder: `medical_reports/${userId}`,
            resource_type: 'auto',
            public_id: `${Date.now()}-${uuidv4()}`,
            timeout: 60000,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              logger.info('Cloudinary upload success', {
                publicId: result.public_id,
                url: result.secure_url,
              });
              resolve(result);
            }
          }
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      logger.error('Cloudinary upload error:', error);
      throw new AppError('File upload failed', 500);
    }
  }

  async deleteFromCloudinary(publicIdOrUrl) {
    try {
      const publicId =
        publicIdOrUrl?.includes('http')
          ? extractCloudinaryPublicId(publicIdOrUrl)
          : publicIdOrUrl;

      if (!publicId) {
        logger.warn('No Cloudinary public id to delete');
        return null;
      }

      return await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.destroy(
          publicId,
          { resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });
    } catch (error) {
      logger.error('Cloudinary delete error:', error);
      throw new AppError('File deletion failed', 500);
    }
  }

  validateFile(file) {
    if (!file) {
      throw new AppError('No file provided', 400);
    }

    if (file.size > config.fileUpload.maxSize) {
      throw new AppError(
        `File size exceeds ${config.fileUpload.maxSize / (1024 * 1024)}MB limit`,
        400
      );
    }

    const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
    if (!config.fileUpload.allowedExtensions.includes(fileExt)) {
      throw new AppError('File type not allowed', 400);
    }

    return true;
  }

  getFileType(mimetype) {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype === 'application/pdf') return 'pdf';
    if (mimetype.includes('word') || mimetype.includes('document'))
      return 'document';
    return 'other';
  }
}

export default new FileUploadService();
