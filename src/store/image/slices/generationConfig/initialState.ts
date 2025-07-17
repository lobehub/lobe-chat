/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { gptImage1ParamsSchema } from '@/config/paramsSchemas/openai/gpt-image-1';
import { ModelProvider } from '@/libs/model-runtime/types/type';
import {
  ModelParamsSchema,
  RuntimeImageGenParams,
  extractDefaultValues,
} from '@/libs/standard-parameters/meta-schema';

export const DEFAULT_AI_IMAGE_PROVIDER = ModelProvider.OpenAI;
export const DEFAULT_AI_IMAGE_MODEL = 'gpt-image-1';
export const DEFAULT_IMAGE_NUM = 4;

export interface GenerationConfigState {
  parameters: RuntimeImageGenParams;
  parametersSchema: ModelParamsSchema;

  provider: string;
  model: string;
  imageNum: number;

  isAspectRatioLocked: boolean;
  activeAspectRatio: string | null; // string - 虚拟比例; null - 原生比例
}

export const DEFAULT_IMAGE_GENERATION_PARAMETERS: RuntimeImageGenParams =
  extractDefaultValues(gptImage1ParamsSchema);

export const initialGenerationConfigState: GenerationConfigState = {
  model: DEFAULT_AI_IMAGE_MODEL,
  provider: DEFAULT_AI_IMAGE_PROVIDER,
  imageNum: DEFAULT_IMAGE_NUM,
  parameters: DEFAULT_IMAGE_GENERATION_PARAMETERS,
  parametersSchema: gptImage1ParamsSchema,
  isAspectRatioLocked: false,
  activeAspectRatio: null,
};
