import debug from 'debug';
import { sha256 } from 'js-sha256';
import mime from 'mime';
import { nanoid } from 'nanoid';
import sharp from 'sharp';

import { LobeChatDatabase } from '@/database/type';
import { FileService } from '@/server/services/file';
import { getYYYYmmddHHMMss } from '@/utils/time';

const log = debug('lobe-image:generation-service');

interface ImageForGeneration {
  buffer: Buffer;
  extension: string;
  hash: string;
  height: number;
  mime: string;
  size: number;
  width: number;
}

/**
 * 图片生成服务
 * 负责处理AI生成图片的转换、上传和封面创建
 */
export class GenerationService {
  private fileService: FileService;

  constructor(db: LobeChatDatabase, userId: string) {
    this.fileService = new FileService(db, userId);
  }

  /**
   * Generate width 512px image as thumbnail when width > 512, end with _512.webp
   */
  async transformImageForGeneration(url: string): Promise<{
    image: ImageForGeneration;
    thumbnailImage: ImageForGeneration;
  }> {
    log('Starting image transformation for:', url.startsWith('data:') ? 'base64 data' : url);

    // If the url is in base64 format, extract the Buffer directly; otherwise, use fetch to get the Buffer
    let originalImageBuffer: Buffer;
    let originalMimeType: string;

    if (url.startsWith('data:')) {
      log('Processing base64 image data');
      // Extract the MIME type and base64 data part
      const [mimeTypePart, base64Data] = url.split(',');
      originalMimeType = mimeTypePart.split(':')[1].split(';')[0];
      originalImageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      log('Fetching image from URL:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch image from ${url}: ${response.status} ${response.statusText}`,
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      originalImageBuffer = Buffer.from(arrayBuffer);
      originalMimeType = response.headers.get('content-type') || 'application/octet-stream';
      log('Successfully fetched image, buffer size:', originalImageBuffer.length);
    }

    // Calculate hash for original image
    const originalHash = sha256(originalImageBuffer);
    log('Original image hash calculated:', originalHash);

    const sharpInstance = sharp(originalImageBuffer);
    const { format, width, height } = await sharpInstance.metadata();
    log('Image metadata:', { format, height, width });

    if (!width || !height) {
      throw new Error(`Invalid image format: ${format}, url: ${url}`);
    }

    const shouldResize = format !== 'webp' || width > 512 || height > 512;
    const thumbnailWidth = shouldResize
      ? width > height
        ? 512
        : Math.round((width * 512) / height)
      : width;
    const thumbnailHeight = shouldResize
      ? height > width
        ? 512
        : Math.round((height * 512) / width)
      : height;

    log('Thumbnail dimensions calculated:', { shouldResize, thumbnailHeight, thumbnailWidth });

    const thumbnailBuffer = shouldResize
      ? await sharpInstance.resize(thumbnailWidth, thumbnailHeight).webp().toBuffer()
      : originalImageBuffer;

    // Calculate hash for thumbnail
    const thumbnailHash = sha256(thumbnailBuffer);
    log('Thumbnail image hash calculated:', thumbnailHash);

    log('Image transformation completed successfully');

    // Determine extension without fallback
    let extension: string;
    if (url.startsWith('data:')) {
      const mimeExtension = mime.getExtension(originalMimeType);
      if (!mimeExtension) {
        throw new Error(`Unable to determine file extension for MIME type: ${originalMimeType}`);
      }
      extension = mimeExtension;
    } else {
      const urlExtension = url.split('.').pop();
      if (!urlExtension) {
        throw new Error(`Unable to determine file extension from URL: ${url}`);
      }
      extension = urlExtension;
    }

    return {
      image: {
        buffer: originalImageBuffer,
        extension,
        hash: originalHash,
        height,
        mime: originalMimeType,
        size: originalImageBuffer.length,
        width,
      },
      thumbnailImage: {
        buffer: thumbnailBuffer,
        extension: 'webp',
        hash: thumbnailHash,
        height: thumbnailHeight,
        mime: 'image/webp',
        size: thumbnailBuffer.length,
        width: thumbnailWidth,
      },
    };
  }

  async uploadImageForGeneration(image: ImageForGeneration, thumbnail: ImageForGeneration) {
    log('Starting image upload for generation');

    const generationImagesFolder = 'generations/images';
    const uuid = nanoid();
    const dateTime = getYYYYmmddHHMMss(new Date());
    const pathPrefix = `${generationImagesFolder}/${uuid}_${image.width}x${image.height}_${dateTime}`;
    const imageKey = `${pathPrefix}_raw.${image.extension}`;
    const thumbnailKey = `${pathPrefix}_thumb.${thumbnail.extension}`;

    log('Generated paths:', { imagePath: imageKey, thumbnailPath: thumbnailKey });

    // Check if image and thumbnail buffers are identical
    const isIdenticalBuffer = image.buffer.equals(thumbnail.buffer);
    log('Buffer comparison:', {
      imageSize: image.buffer.length,
      isIdenticalBuffer,
      thumbnailSize: thumbnail.buffer.length,
    });

    if (isIdenticalBuffer) {
      log('Buffers are identical, uploading single image');
      // If buffers are identical, only upload once
      const result = await this.fileService.uploadMedia(imageKey, image.buffer);
      log('Single image uploaded successfully:', result.key);
      // Use the same key for both image and thumbnail
      return {
        imageUrl: result.key,
        thumbnailImageUrl: result.key,
      };
    } else {
      log('Buffers are different, uploading both images');
      // If buffers are different, upload both
      const [imageResult, thumbnailResult] = await Promise.all([
        this.fileService.uploadMedia(imageKey, image.buffer),
        this.fileService.uploadMedia(thumbnailKey, thumbnail.buffer),
      ]);

      log('Both images uploaded successfully:', {
        imageUrl: imageResult.key,
        thumbnailImageUrl: thumbnailResult.key,
      });

      return {
        imageUrl: imageResult.key,
        thumbnailImageUrl: thumbnailResult.key,
      };
    }
  }

  /**
   * Create a 256x256 cover image from a given URL and upload
   * @param coverUrl - The source image URL (can be base64 or HTTP URL)
   * @returns The key of the uploaded cover image
   */
  async createCoverFromUrl(coverUrl: string): Promise<string> {
    log('Creating cover image from URL:', coverUrl.startsWith('data:') ? 'base64 data' : coverUrl);

    // Download the original image
    let originalImageBuffer: Buffer;
    if (coverUrl.startsWith('data:')) {
      log('Processing base64 cover image data');
      // Extract base64 data part
      const [, base64Data] = coverUrl.split(',');
      originalImageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      log('Fetching cover image from URL:', coverUrl);
      const response = await fetch(coverUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch cover image from ${coverUrl}: ${response.status} ${response.statusText}`,
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      originalImageBuffer = Buffer.from(arrayBuffer);
      log('Successfully fetched cover image, buffer size:', originalImageBuffer.length);
    }

    // Process image to 256x256 cover with webp format
    log('Processing cover image to 256x256 webp format');
    const coverBuffer = await sharp(originalImageBuffer)
      .resize(256, 256, { fit: 'cover', position: 'center' })
      .toBuffer();

    log('Cover image processed, final size:', coverBuffer.length);

    // Upload using FileService
    const coverFolder = 'generations/covers';
    const uuid = nanoid();
    const dateTime = getYYYYmmddHHMMss(new Date());
    const coverKey = `${coverFolder}/${uuid}_cover_${dateTime}.webp`;

    log('Uploading cover image:', coverKey);
    const result = await this.fileService.uploadMedia(coverKey, coverBuffer);

    log('Cover image uploaded successfully:', result.key);
    return result.key;
  }
}
