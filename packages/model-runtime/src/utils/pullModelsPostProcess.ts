import { CHAT_MODEL_IMAGE_GENERATION_PARAMS } from '@/const/image';
import type { AiModelType } from '@/types/aiModel';
import type { ChatModelCard } from '@/types/llm';

// 支持自动生成图像模型的白名单
export const IMAGE_GENERATION_MODEL_WHITELIST = [
  'gemini-2.5-flash-image-preview',
  // 未来可以添加更多模型
] as const;

/**
 * 处理模型列表：确保 type 字段存在，并为白名单模型生成图像生成模型
 * @param models 原始模型列表
 * @param getModelTypeProperty 可选的获取模型 type 属性的回调函数
 * @returns 处理后的模型列表（包含图像生成模型）
 */
export async function processModelListWithImageModels(
  models: ChatModelCard[],
  getModelTypeProperty?: (modelId: string) => Promise<AiModelType>,
): Promise<ChatModelCard[]> {
  // 1. 确保所有模型都有 type 字段
  const finalModels = await Promise.all(
    models.map(async (model) => {
      let modelType: AiModelType | undefined = model.type;

      if (!modelType && getModelTypeProperty) {
        modelType = await getModelTypeProperty(model.id);
      }

      return {
        ...model,
        type: modelType || 'chat',
      };
    }),
  );

  // 2. 检查白名单中的模型并生成对应的图像版本
  const imageModels: ChatModelCard[] = [];

  for (const whitelistPattern of IMAGE_GENERATION_MODEL_WHITELIST) {
    const matchingModels = finalModels.filter((model) => model.id.endsWith(whitelistPattern));

    for (const model of matchingModels) {
      imageModels.push({
        ...model, // 复用原模型的所有配置
        id: `${model.id}:image`,
        // 覆盖为 image 类型
        parameters: CHAT_MODEL_IMAGE_GENERATION_PARAMS,
        type: 'image', // 设置图像参数
      });
    }
  }

  return [...finalModels, ...imageModels];
}
