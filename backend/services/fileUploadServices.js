import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import axios from 'axios';
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

export function getCloudinaryResourceType(mimetype) {
  if (mimetype?.startsWith('image/')) return 'image';
  return 'raw';
}

export function getResourceTypeFromUrl(fileUrl) {
  if (fileUrl.includes('/raw/upload/')) return 'raw';
  if (fileUrl.includes('/video/upload/')) return 'video';
  return 'image';
}

export class FileUploadService {
  async uploadToCloudinary(file, userId) {
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey) {
      throw new AppError('Cloudinary is not configured', 500);
    }

    const resourceType = getCloudinaryResourceType(file.mimetype);

    const tryUpload = (options) =>
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

    try {
      let result;
      try {
        result = await tryUpload({
          folder: `medical_reports/${userId}`,
          resource_type: resourceType,
          type: 'authenticated',
          public_id: `${Date.now()}-${uuidv4()}`,
          timeout: 60000,
          access_mode: 'authenticated',
        });
      } catch (authError) {
        logger.warn('Authenticated Cloudinary upload failed, retrying as upload type', {
          message: authError.message,
        });
        result = await tryUpload({
          folder: `medical_reports/${userId}`,
          resource_type: resourceType,
          public_id: `${Date.now()}-${uuidv4()}`,
          timeout: 60000,
        });
      }

      const signedUrl = cloudinary.v2.url(result.public_id, {
        resource_type: result.resource_type || resourceType,
        type: result.type || 'upload',
        secure: true,
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      });

      console.log('Cloudinary upload success', {
        publicId: result.public_id,
        resourceType: result.resource_type,
        type: result.type,
      });

      return {
        ...result,
        secure_url: signedUrl || result.secure_url,
      };
    } catch (error) {
      logger.error('Cloudinary upload error:', error);
      throw new AppError('File upload failed', 500);
    }
  }

  async downloadFileBuffer(fileUrl) {
    const publicId = extractCloudinaryPublicId(fileUrl);

    if (!publicId) {
      throw new AppError('Invalid file URL', 400);
    }

    const resourceTypes = [
      getResourceTypeFromUrl(fileUrl),
      'raw',
      'image',
    ];
    const uniqueResourceTypes = [...new Set(resourceTypes)];

    const deliveryTypes = ['authenticated', 'upload', 'private'];

    for (const resourceType of uniqueResourceTypes) {
      for (const deliveryType of deliveryTypes) {
        try {
          const signedUrl = cloudinary.v2.url(publicId, {
            resource_type: resourceType,
            type: deliveryType,
            secure: true,
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
          });

          const response = await axios.get(signedUrl, {
            responseType: 'arraybuffer',
            timeout: 90000,
            validateStatus: (status) => status < 500,
          });

          if (response.status === 200 && response.data?.byteLength > 0) {
            return Buffer.from(response.data);
          }
        } catch (error) {
          logger.debug('Cloudinary signed download attempt failed', {
            resourceType,
            deliveryType,
            message: error.message,
          });
        }
      }
    }

    try {
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
        timeout: 90000,
        validateStatus: (status) => status < 500,
      });

      if (response.status === 200 && response.data?.byteLength > 0) {
        return Buffer.from(response.data);
      }
    } catch (error) {
      logger.error('Direct file download failed', { message: error.message, fileUrl });
    }

    throw new AppError('Failed to download file for text extraction', 502);
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

      const resourceTypes = publicIdOrUrl?.includes('http')
        ? [getResourceTypeFromUrl(publicIdOrUrl), 'raw', 'image']
        : ['raw', 'image'];

      for (const resourceType of [...new Set(resourceTypes)]) {
        try {
          const result = await cloudinary.v2.uploader.destroy(publicId, {
            resource_type: resourceType,
          });
          if (result.result === 'ok' || result.result === 'not found') {
            return result;
          }
        } catch (error) {
          logger.debug('Cloudinary delete attempt failed', {
            resourceType,
            message: error.message,
          });
        }
      }

      return null;
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
