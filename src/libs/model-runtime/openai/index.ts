import debug from 'debug';
import { toFile } from 'openai';
import { FileLike } from 'openai/uploads';

import { responsesAPIModels } from '@/const/models';
import { RuntimeImageGenParamsValue } from '@/libs/standard-parameters/meta-schema';

import { ChatStreamPayload, ModelProvider } from '../types';
import { processMultiProviderModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';
import { pruneReasoningPayload } from '../utils/openaiHelpers';

export interface OpenAIModelCard {
  id: string;
}

const prunePrefixes = ['o1', 'o3', 'o4', 'codex', 'computer-use'];

const oaiSearchContextSize = process.env.OPENAI_SEARCH_CONTEXT_SIZE; // low, medium, high

const log = debug('lobe-image:openai');

/**
 * 将图片 URL 转换为 File 对象
 * @param imageUrl - 图片 URL（可以是 HTTP URL 或 base64 data URL）
 * @returns FileLike 对象
 */
export const convertImageUrlToFile = async (imageUrl: string): Promise<FileLike> => {
  log('Converting image URL to File: %s', imageUrl.startsWith('data:') ? 'base64 data' : imageUrl);

  let buffer: Buffer;
  let mimeType: string;

  if (imageUrl.startsWith('data:')) {
    // 处理 base64 data URL
    log('Processing base64 image data');
    const [mimeTypePart, base64Data] = imageUrl.split(',');
    mimeType = mimeTypePart.split(':')[1].split(';')[0];
    buffer = Buffer.from(base64Data, 'base64');
  } else {
    // 处理 HTTP URL
    log('Fetching image from URL: %s', imageUrl);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from ${imageUrl}: ${response.statusText}`);
    }
    buffer = Buffer.from(await response.arrayBuffer());
    mimeType = response.headers.get('content-type') || 'image/png';
  }

  log('Successfully converted image to buffer, size: %s, mimeType: %s', buffer.length, mimeType);

  // 使用 OpenAI 的 toFile 方法创建 File 对象
  return toFile(buffer, `image.${mimeType.split('/')[1]}`, { type: mimeType });
};

export const LobeOpenAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.openai.com/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { enabledSearch, model, ...rest } = payload;

      if (responsesAPIModels.has(model) || enabledSearch) {
        return { ...rest, apiMode: 'responses', enabledSearch, model } as ChatStreamPayload;
      }

      if (prunePrefixes.some((prefix) => model.startsWith(prefix))) {
        return pruneReasoningPayload(payload) as any;
      }

      if (model.includes('-search-')) {
        return {
          ...rest,
          frequency_penalty: undefined,
          model,
          presence_penalty: undefined,
          stream: payload.stream ?? true,
          temperature: undefined,
          top_p: undefined,
          ...(oaiSearchContextSize && {
            web_search_options: {
              search_context_size: oaiSearchContextSize,
            },
          }),
        } as any;
      }

      return { ...rest, model, stream: payload.stream ?? true };
    },
  },
  createImage: async (payload) => {
    const { model, params, client } = payload;
    log('Creating image with model: %s and params: %O', model, params);

    const defaultInput = {
      n: 1,
    };

    // 映射参数名称，将 imageUrls 映射为 image
    const paramsMap = new Map<RuntimeImageGenParamsValue, string>([['imageUrls', 'image']]);
    const userInput: Record<string, any> = Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        paramsMap.get(key as RuntimeImageGenParamsValue) ?? key,
        value,
      ]),
    );

    const isImageEdit = Array.isArray(userInput.image) && userInput.image.length > 0;
    // 如果有 imageUrls 参数，将其转换为 File 对象
    if (isImageEdit) {
      log('Converting imageUrls to File objects: %O', userInput.image);
      try {
        // 转换所有图片 URL 为 File 对象
        const imageFiles = await Promise.all(
          userInput.image.map((url: string) => convertImageUrlToFile(url)),
        );

        log('Successfully converted %d images to File objects', imageFiles.length);

        // 根据官方文档，如果有多个图片，传递数组；如果只有一个，传递单个 File
        userInput.image = imageFiles.length === 1 ? imageFiles[0] : imageFiles;
      } catch (error) {
        log('Error converting imageUrls to File objects: %O', error);
        throw new Error(`Failed to convert image URLs to File objects: ${error}`);
      }
    } else {
      delete userInput.image;
    }

    if (userInput.size === 'auto') {
      delete userInput.size;
    }

    const options = {
      model,
      ...defaultInput,
      ...(userInput as any),
    };

    log('options: %O', options);

    // 判断是否为图片编辑操作
    const img = isImageEdit
      ? await client.images.edit(options)
      : await client.images.generate(options);

    // 检查响应数据的完整性
    if (!img || !img.data || !Array.isArray(img.data) || img.data.length === 0) {
      log('Invalid image response: missing data array');
      throw new Error('Invalid image response: missing or empty data array');
    }

    const imageData = img.data[0];
    if (!imageData) {
      log('Invalid image response: first data item is null/undefined');
      throw new Error('Invalid image response: first data item is null or undefined');
    }

    if (!imageData.b64_json) {
      log('Invalid image response: missing b64_json field');
      throw new Error('Invalid image response: missing b64_json field');
    }

    // 确定图片的 MIME 类型，默认为 PNG
    const mimeType = 'image/png'; // OpenAI 图片生成默认返回 PNG 格式

    // 将 base64 字符串转换为完整的 data URL
    const dataUrl = `data:${mimeType};base64,${imageData.b64_json}`;

    log('Successfully converted base64 to data URL, length: %d', dataUrl.length);

    return {
      imageUrl: dataUrl,
    };
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENAI_CHAT_COMPLETION === '1',
    responses: () => process.env.DEBUG_OPENAI_RESPONSES === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: OpenAIModelCard[] = modelsPage.data;

    // 自动检测模型提供商并选择相应配置
    return processMultiProviderModelList(modelList);
  },
  provider: ModelProvider.OpenAI,
  responses: {
    handlePayload: (payload) => {
      const { enabledSearch, model, tools, ...rest } = payload;

      const openaiTools = enabledSearch
        ? [
            ...(tools || []),
            {
              type: 'web_search_preview',
              ...(oaiSearchContextSize && {
                search_context_size: oaiSearchContextSize,
              }),
            },
          ]
        : tools;

      if (prunePrefixes.some((prefix) => model.startsWith(prefix))) {
        return pruneReasoningPayload({
          ...rest,
          model,
          reasoning: payload.reasoning
            ? { ...payload.reasoning, summary: 'auto' }
            : { summary: 'auto' },
          stream: payload.stream ?? true,
          tools: openaiTools as any,
          // computer-use series must set truncation as auto
          ...(model.startsWith('computer-use') && { truncation: 'auto' }),
        }) as any;
      }

      return { ...rest, model, stream: payload.stream ?? true, tools: openaiTools } as any;
    },
  },
});
