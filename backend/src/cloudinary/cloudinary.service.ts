import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(filePath: string) {
    return await cloudinary.uploader.upload(
      filePath,
      {
        folder: 'propiedades',
      },
    );
  }

  // Sube un archivo desde el buffer en memoria (no requiere guardarlo en disco)
  uploadBuffer(buffer: Buffer, folder = 'comprobantes'): Promise<any> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      stream.end(buffer);
    });
  }

  async deleteImage(publicId: string) {
    return await cloudinary.uploader.destroy(
      publicId,
    );
  }
}