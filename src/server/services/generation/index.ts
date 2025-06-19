import debug from 'debug';
import { sha256 } from 'js-sha256';
import mime from 'mime';
import { nanoid } from 'nanoid';
import sharp from 'sharp';

import { S3 } from '@/server/modules/S3';
import { getYYYYmmddHHMMss } from '@/utils/time';
import { inferContentTypeFromImageUrl } from '@/utils/url';

const log = debug('lobe-image:generation-service');

interface ImageForGeneration {
  buffer: Buffer;
  width: number;
  height: number;
  extension: string;
  mime: string;
  size: number;
  hash: string;
}

/**
 * Generate width 512px image as thumbnail when width > 512, end with _512.webp
 */
export async function transformImageForGeneration(url: string): Promise<{
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
      throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
    }
    originalImageBuffer = Buffer.from(await response.arrayBuffer());
    originalMimeType = inferContentTypeFromImageUrl(url) || 'image/jpeg';
    log('Successfully fetched image, buffer size:', originalImageBuffer.length);
  }

  // Calculate hash for original image
  const originalHash = sha256(originalImageBuffer);
  log('Original image hash calculated:', originalHash);

  const sharpInstance = sharp(originalImageBuffer);
  const { format, width, height } = await sharpInstance.metadata();
  log('Image metadata:', { format, width, height });

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

  log('Thumbnail dimensions calculated:', { thumbnailWidth, thumbnailHeight, shouldResize });

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
      width,
      height,
      extension,
      mime: originalMimeType,
      size: originalImageBuffer.length,
      hash: originalHash,
    },
    thumbnailImage: {
      buffer: thumbnailBuffer,
      width: thumbnailWidth,
      height: thumbnailHeight,
      extension: 'webp',
      mime: 'image/webp',
      size: thumbnailBuffer.length,
      hash: thumbnailHash,
    },
  };
}

export async function uploadImageForGeneration(
  image: ImageForGeneration,
  thumbnail: ImageForGeneration,
) {
  log('Starting image upload for generation');

  const s3 = new S3();

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
    isIdenticalBuffer,
    imageSize: image.buffer.length,
    thumbnailSize: thumbnail.buffer.length,
  });

  if (isIdenticalBuffer) {
    log('Buffers are identical, uploading single image');
    // If buffers are identical, only upload once
    await s3.uploadMedia(imageKey, image.buffer);
    log('Single image uploaded successfully:', imageKey);
    // Use the same URL for both image and thumbnail
    return {
      imageUrl: imageKey,
      thumbnailImageUrl: imageKey,
    };
  } else {
    log('Buffers are different, uploading both images');
    // If buffers are different, upload both
    await Promise.all([
      s3.uploadMedia(imageKey, image.buffer),
      s3.uploadMedia(thumbnailKey, thumbnail.buffer),
    ]);

    log('Both images uploaded successfully:', {
      imageUrl: imageKey,
      thumbnailImageUrl: thumbnailKey,
    });

    return {
      imageUrl: imageKey,
      thumbnailImageUrl: thumbnailKey,
    };
  }
}

/**
 * Create a 256x256 cover image from a given URL and upload to S3
 * @param coverUrl - The source image URL (can be base64 or HTTP URL)
 * @returns The S3 key of the uploaded cover image
 */
export async function createCoverFromUrl(coverUrl: string): Promise<string> {
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
      throw new Error(`Failed to fetch cover image from ${coverUrl}: ${response.statusText}`);
    }
    originalImageBuffer = Buffer.from(await response.arrayBuffer());
    log('Successfully fetched cover image, buffer size:', originalImageBuffer.length);
  }

  // Process image to 256x256 cover with webp format
  log('Processing cover image to 256x256 webp format');
  const coverBuffer = await sharp(originalImageBuffer)
    .resize(256, 256, { fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toBuffer();

  log('Cover image processed, final size:', coverBuffer.length);

  // Upload to S3
  const s3 = new S3();
  const coverFolder = 'generations/covers';
  const uuid = nanoid();
  const dateTime = getYYYYmmddHHMMss(new Date());
  const coverKey = `${coverFolder}/${uuid}_cover_${dateTime}.webp`;

  log('Uploading cover image to S3:', coverKey);
  await s3.uploadMedia(coverKey, coverBuffer);

  log('Cover image uploaded successfully:', coverKey);
  return coverKey;
}
