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
