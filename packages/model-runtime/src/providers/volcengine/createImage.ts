import createDebug from 'debug';
import { RuntimeImageGenParamsValue } from 'model-bank';
import OpenAI from 'openai';

import { CreateImageOptions } from '../../core/openaiCompatibleFactory';
import { CreateImagePayload, CreateImageResponse } from '../../types/image';

const log = createDebug('lobe-image:volcengine');

/**
 * Volcengine image generation implementation
 * Based on Volcengine API docs: https://www.volcengine.com/docs/82379/1541523
 */
export async function createVolcengineImage(
  payload: CreateImagePayload,
  options: CreateImageOptions,
): Promise<CreateImageResponse> {
  const { model, params } = payload;
  log('Creating image with Volcengine API - model: %s, params: %O', model, params);

  // Create OpenAI client with Volcengine configuration
  const client = new OpenAI({
    apiKey: options.apiKey,
    baseURL: options.baseURL || 'https://ark.cn-beijing.volces.com/api/v3',
  });

  // Parameter mapping: imageUrls/imageUrl -> image, cfg -> guidance_scale
  const paramsMap = new Map<RuntimeImageGenParamsValue, string>([
    ['imageUrls', 'image'],
    ['imageUrl', 'image'],
    ['cfg', 'guidance_scale'],
  ]);

  const userInput: Record<string, any> = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      paramsMap.get(key as RuntimeImageGenParamsValue) ?? key,
      value,
    ]),
  );

  // Volcengine supports direct URL or base64, no need to convert to File objects
  // Check if there is image input
  const hasImageInput =
    userInput.image !== null &&
    userInput.image !== undefined &&
    (Array.isArray(userInput.image) ? userInput.image.length > 0 : true);

  if (hasImageInput) {
    log('Image input detected: %O', userInput.image);
    if (Array.isArray(userInput.image)) {
      userInput.image = userInput.image[0];
    }
  } else {
    delete userInput.image;
  }
  if (userInput.cfg !== undefined && userInput.guidance_scale === undefined) {
    userInput.guidance_scale = userInput.cfg;
    delete userInput.cfg;
  }

  // 设置模型专有的默认参数
  const defaultParams = {
    guidance_scale: 10,
    response_format: 'url',
    size: 'adaptive',
    watermark: false,
  };

  // If width/height provided and size not set, construct size string
  if (
    userInput.width &&
    userInput.height &&
    !userInput.size &&
    Number.isFinite(userInput.width) &&
    Number.isFinite(userInput.height)
  ) {
    userInput.size = `${userInput.width}x${userInput.height}`;
    delete userInput.width;
    delete userInput.height;
  }

  // SeedEdit 模型必须提供 image 输入，同时强制 size=adaptive
  if (model.includes('seededit')) {
    const hasImage = !!userInput.image && (Array.isArray(userInput.image) ? userInput.image.length > 0 : true);
    if (!hasImage) {
      throw new Error('SeedEdit model requires an input image. Please upload an image first.');
    }
    userInput.size = 'adaptive';
  }

  // 针对 doubao-seededit-3-0-i2i-250628 模型，移除不支持的参数
  if (model === 'doubao-seededit-3-0-i2i-250628') {
    delete (userInput as Record<string, any>).width;
    delete (userInput as Record<string, any>).height;
    delete (userInput as Record<string, any>).n;
    userInput.size = 'adaptive';
  }

  // Build request options with defaults then user inputs (user overrides defaults)
  const requestOptions = {
    model,
    ...defaultParams,
    ...userInput,
  } as Record<string, any>;

  log('Volcengine API options: %O', requestOptions);

  // Call Volcengine image generation API (OpenAI-compatible)
  const response = await client.images.generate(requestOptions as any);

  log('Volcengine API response: %O', response);

  // Validate response data
  if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
    log('Invalid response: missing data array');
    throw new Error('Invalid response: missing or empty data array');
  }

  const imageData = response.data[0];
  if (!imageData) {
    log('Invalid response: first data item is null/undefined');
    throw new Error('Invalid response: first data item is null or undefined');
  }

  let imageUrl: string;
  let width: number | undefined;
  let height: number | undefined;

  // Handle base64 format response
  if ((imageData as any).b64_json) {
    const mimeType = 'image/jpeg';
    imageUrl = `data:${mimeType};base64,${(imageData as any).b64_json}`;
    log('Successfully converted base64 to data URL, length: %d', imageUrl.length);
  }
  // Handle URL format response
  else if ((imageData as any).url) {
    imageUrl = (imageData as any).url;
    log('Using direct image URL: %s', imageUrl);
  }
  // If neither format exists, throw error
  else {
    log('Invalid response: missing both b64_json and url fields');
    throw new Error('Invalid response: missing both b64_json and url fields');
  }

  // Extract size information (Volcengine specific)
  const volcengineImageData = imageData as any;
  if (typeof volcengineImageData.width === 'number') width = volcengineImageData.width;
  if (typeof volcengineImageData.height === 'number') height = volcengineImageData.height;

  if ((!width || !height) && volcengineImageData.size) {
    const sizeMatch = (volcengineImageData.size as string).match(/^(\d+)x(\d+)$/);
    if (sizeMatch) {
      width = parseInt(sizeMatch[1], 10);
      height = parseInt(sizeMatch[2], 10);
      log('Extracted image dimensions: %dx%d', width, height);
    }
  }

  return {
    height,
    imageUrl,
    width,
  };
}
