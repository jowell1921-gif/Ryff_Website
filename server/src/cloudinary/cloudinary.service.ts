import { Injectable } from '@nestjs/common'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
  }

  uploadVideo(buffer: Buffer): Promise<{ url: string; publicId: string; thumbnailUrl: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'ryff/reels',
          eager: [{ width: 540, height: 960, crop: 'fill', format: 'jpg' }],
        },
        (error, result) => {
          if (error || !result) return reject(error)
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            thumbnailUrl: result.eager?.[0]?.secure_url ?? result.secure_url,
          })
        },
      )
      Readable.from(buffer).pipe(stream)
    })
  }
}
