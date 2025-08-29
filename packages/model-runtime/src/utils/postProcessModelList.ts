import { CHAT_MODEL_IMAGE_GENERATION_PARAMS } from '@/const/image';
import type { AiModelType } from '@/types/aiModel';
import type { ChatModelCard } from '@/types/llm';

// Whitelist for automatic image model generation
export const IMAGE_GENERATION_MODEL_WHITELIST = [
  'gemini-2.5-flash-image-preview',
  // More models can be added in the future
] as const;

/**
 * Process model list: ensure type field exists and generate image generation models for whitelisted models
 * @param models Original model list
 * @param getModelTypeProperty Optional callback function to get model type property
 * @returns Processed model list (including image generation models)
 */
export async function postProcessModelList(
  models: ChatModelCard[],
  getModelTypeProperty?: (modelId: string) => Promise<AiModelType>,
): Promise<ChatModelCard[]> {
  // 1. Ensure all models have type field
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

  // 2. Check whitelist models and generate corresponding image versions
  const imageModels: ChatModelCard[] = [];

  for (const whitelistPattern of IMAGE_GENERATION_MODEL_WHITELIST) {
    const matchingModels = finalModels.filter((model) => model.id.endsWith(whitelistPattern));

    for (const model of matchingModels) {
      imageModels.push({
        ...model, // Reuse all configurations from the original model
        id: `${model.id}:image`,
        // Override to image type
        parameters: CHAT_MODEL_IMAGE_GENERATION_PARAMS,
        type: 'image', // Set image parameters
      });
    }
  }

  return [...finalModels, ...imageModels];
}
