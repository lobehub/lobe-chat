import { LanguageModel } from '@/types/llm';

/**
 * A white list of language models that are allowed to display and be used in the app.
 */
export const LanguageModelWhiteList = [
  // OpenAI
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
  'gpt-4',
  'gpt-4-32k',
];

export const DEFAULT_OPENAI_MODEL_LIST: string[] = Object.values(LanguageModel);

// vision model white list, these models will change the content from string to array
// refs: https://github.com/lobehub/lobe-chat/issues/790
export const isVisionModel = (model?: string) => !!model && model.includes('vision');

// refs: https://github.com/lobehub/lobe-chat/issues/837
export const GPT4_VISION_MODEL_DEFAULT_MAX_TOKENS = 2048;

// refs to: https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo
export const ModelTokens: Record<LanguageModel, number> = {
  [LanguageModel.GPT3_5]: 4096,
  [LanguageModel.GPT3_5_1106]: 16_385,
  [LanguageModel.GPT3_5_16K]: 16_385,
  [LanguageModel.GPT4]: 8196,
  [LanguageModel.GPT4_PREVIEW]: 128_000,
  [LanguageModel.GPT4_VISION_PREVIEW]: 128_000,
  [LanguageModel.GPT4_32K]: 32_768,
};
