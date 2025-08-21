import debug from 'debug';

import { CreateImagePayload, CreateImageResponse } from '../types/image';
import { CreateImageOptions } from '../utils/openaiCompatibleFactory';

const log = debug('lobe-image:volcengine');

export async function createVolcengineImage(
  payload: CreateImagePayload,
  options: CreateImageOptions,
): Promise<CreateImageResponse> {
  const { model, params } = payload;
  const { apiKey, baseURL } = options;

  log('Creating image with Volcengine model: %s and params: %O', model, params);

  // 映射参数名称，将 imageUrl 映射为 image
  const userInput: Record<string, any> = { ...params };

  // 处理图片参数 - Volcengine API 需要直接的 URL 字符串
  if (userInput.imageUrl) {
    userInput.image = userInput.imageUrl;
    delete userInput.imageUrl;
  }

  // 如果有 imageUrls 数组，取第一个作为 image 参数
  if (userInput.imageUrls && Array.isArray(userInput.imageUrls) && userInput.imageUrls.length > 0) {
    userInput.image = userInput.imageUrls[0];
    delete userInput.imageUrls;
  }

  // 将通用的 cfg 参数映射到 Volcengine 的 guidance_scale
  if (userInput.cfg !== undefined && userInput.guidance_scale === undefined) {
    userInput.guidance_scale = userInput.cfg;
    delete userInput.cfg;
  }

  // 设置模型专有的默认参数（按照用户要求的默认值）
  const defaultParams = {
    guidance_scale: 10,
    response_format: 'url',
    size: 'adaptive',
    watermark: false,
  };

  // 对于 doubao-seededit 模型，确保有图片输入
  if (model.includes('seededit') && !userInput.image) {
    throw new Error('SeedEdit model requires an input image. Please upload an image first.');
  }

  // 如果 width/height 存在而 size 未设置，则将其映射为 Ark 的 size 字段
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

  // 针对 doubao-seededit-3-0-i2i-250628 模型的特殊处理
  let finalUserInput = { ...userInput };
  if (model === 'doubao-seededit-3-0-i2i-250628') {
    // 移除不支持的参数，但保留 size（该模型需要 size 参数）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { width, height, n, ...allowedParams } = finalUserInput;
    finalUserInput = allowedParams;
    // 强制设置 size 参数为 adaptive（该模型仅支持此值）
    finalUserInput.size = 'adaptive';
  }

  // 构建请求参数
  const requestBody: Record<string, any> = {
    model,
    prompt: finalUserInput.prompt || '',
    ...defaultParams,
    ...finalUserInput,
  };

  // 移除空值
  Object.keys(requestBody).forEach((key) => {
    if (requestBody[key] === undefined || requestBody[key] === null) {
      delete requestBody[key];
    }
  });

  log('Final request body: %O', requestBody);

  // 发送请求到 Volcengine API
  const response = await fetch(`${baseURL}/images/generations`, {
    body: JSON.stringify(requestBody),
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    const errorText = await response.text();
    log('Volcengine API error: %s %s', response.status, errorText);
    throw new Error(`Volcengine API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  log('Volcengine API response: %O', result);

  // 检查响应格式
  if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
    throw new Error('Invalid response from Volcengine API: missing or empty data array');
  }

  const imageData = result.data[0];
  if (!imageData.url) {
    throw new Error('Invalid response from Volcengine API: missing image URL');
  }

  return {
    height: imageData.height,
    imageUrl: imageData.url,
    width: imageData.width,
  };
}
