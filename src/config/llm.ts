/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const getLLMConfig = () => {
  return createEnv({
    server: {
      API_KEY_SELECT_MODE: z.string().optional(),

      ENABLED_OPENAI: z.boolean(),
      OPENAI_API_KEY: z.string().optional(),
      OPENAI_PROXY_URL: z.string().optional(),
      OPENAI_MODEL_LIST: z.string().optional(),

      ENABLED_AZURE_OPENAI: z.boolean(),
      AZURE_API_KEY: z.string().optional(),
      AZURE_API_VERSION: z.string().optional(),
      AZURE_ENDPOINT: z.string().optional(),
      AZURE_MODEL_LIST: z.string().optional(),

      ENABLED_ZHIPU: z.boolean(),
      ZHIPU_API_KEY: z.string().optional(),

      ENABLED_DEEPSEEK: z.boolean(),
      DEEPSEEK_API_KEY: z.string().optional(),

      ENABLED_GOOGLE: z.boolean(),
      GOOGLE_API_KEY: z.string().optional(),
      GOOGLE_PROXY_URL: z.string().optional(),

      ENABLED_MOONSHOT: z.boolean(),
      MOONSHOT_API_KEY: z.string().optional(),
      MOONSHOT_PROXY_URL: z.string().optional(),

      ENABLED_PERPLEXITY: z.boolean(),
      PERPLEXITY_API_KEY: z.string().optional(),
      PERPLEXITY_PROXY_URL: z.string().optional(),

      ENABLED_ANTHROPIC: z.boolean(),
      ANTHROPIC_API_KEY: z.string().optional(),
      ANTHROPIC_PROXY_URL: z.string().optional(),

      ENABLED_MINIMAX: z.boolean(),
      MINIMAX_API_KEY: z.string().optional(),

      ENABLED_MISTRAL: z.boolean(),
      MISTRAL_API_KEY: z.string().optional(),

      ENABLED_GROQ: z.boolean(),
      GROQ_API_KEY: z.string().optional(),
      GROQ_PROXY_URL: z.string().optional(),

      ENABLED_OPENROUTER: z.boolean(),
      OPENROUTER_API_KEY: z.string().optional(),
      OPENROUTER_MODEL_LIST: z.string().optional(),

      ENABLED_ZEROONE: z.boolean(),
      ZEROONE_API_KEY: z.string().optional(),

      ENABLED_TOGETHERAI: z.boolean(),
      TOGETHERAI_API_KEY: z.string().optional(),
      TOGETHERAI_MODEL_LIST: z.string().optional(),

      ENABLED_AWS_BEDROCK: z.boolean(),
      AWS_REGION: z.string().optional(),
      AWS_ACCESS_KEY_ID: z.string().optional(),
      AWS_SECRET_ACCESS_KEY: z.string().optional(),

      ENABLED_OLLAMA: z.boolean(),
      OLLAMA_PROXY_URL: z.string().optional(),
      OLLAMA_MODEL_LIST: z.string().optional(),

      ENABLED_QWEN: z.boolean(),
      QWEN_API_KEY: z.string().optional(),

      ENABLED_STEPFUN: z.boolean(),
      STEPFUN_API_KEY: z.string().optional(),

      ENABLED_NOVITA: z.boolean(),
      NOVITA_API_KEY: z.string().optional(),

      ENABLED_BAICHUAN: z.boolean(),
      BAICHUAN_API_KEY: z.string().optional(),

      ENABLED_TAICHU: z.boolean(),
      TAICHU_API_KEY: z.string().optional(),

      ENABLED_AI360: z.boolean(),
      AI360_API_KEY: z.string().optional(),

      ENABLED_SILICONCLOUD: z.boolean(),
      SILICONCLOUD_API_KEY: z.string().optional(),
      SILICONCLOUD_MODEL_LIST: z.string().optional(),
      SILICONCLOUD_PROXY_URL: z.string().optional(),
    },
    runtimeEnv: {
      API_KEY_SELECT_MODE: process.env.API_KEY_SELECT_MODE,

      ENABLED_OPENAI: process.env.ENABLED_OPENAI !== '0',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_PROXY_URL: process.env.OPENAI_PROXY_URL,
      OPENAI_MODEL_LIST: process.env.OPENAI_MODEL_LIST,

      ENABLED_AZURE_OPENAI: !!process.env.AZURE_API_KEY,
      AZURE_API_KEY: process.env.AZURE_API_KEY,
      AZURE_API_VERSION: process.env.AZURE_API_VERSION,
      AZURE_ENDPOINT: process.env.AZURE_ENDPOINT,
      AZURE_MODEL_LIST: process.env.AZURE_MODEL_LIST,

      ENABLED_ZHIPU: !!process.env.ZHIPU_API_KEY,
      ZHIPU_API_KEY: process.env.ZHIPU_API_KEY,

      ENABLED_DEEPSEEK: !!process.env.DEEPSEEK_API_KEY,
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,

      ENABLED_GOOGLE: !!process.env.GOOGLE_API_KEY,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      GOOGLE_PROXY_URL: process.env.GOOGLE_PROXY_URL,

      ENABLED_PERPLEXITY: !!process.env.PERPLEXITY_API_KEY,
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
      PERPLEXITY_PROXY_URL: process.env.PERPLEXITY_PROXY_URL,

      ENABLED_ANTHROPIC: !!process.env.ANTHROPIC_API_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      ANTHROPIC_PROXY_URL: process.env.ANTHROPIC_PROXY_URL,

      ENABLED_MINIMAX: !!process.env.MINIMAX_API_KEY,
      MINIMAX_API_KEY: process.env.MINIMAX_API_KEY,

      ENABLED_MISTRAL: !!process.env.MISTRAL_API_KEY,
      MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,

      ENABLED_OPENROUTER: !!process.env.OPENROUTER_API_KEY,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      OPENROUTER_MODEL_LIST: process.env.OPENROUTER_MODEL_LIST,

      ENABLED_TOGETHERAI: !!process.env.TOGETHERAI_API_KEY,
      TOGETHERAI_API_KEY: process.env.TOGETHERAI_API_KEY,
      TOGETHERAI_MODEL_LIST: process.env.TOGETHERAI_MODEL_LIST,

      ENABLED_MOONSHOT: !!process.env.MOONSHOT_API_KEY,
      MOONSHOT_API_KEY: process.env.MOONSHOT_API_KEY,
      MOONSHOT_PROXY_URL: process.env.MOONSHOT_PROXY_URL,

      ENABLED_GROQ: !!process.env.GROQ_API_KEY,
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      GROQ_PROXY_URL: process.env.GROQ_PROXY_URL,

      ENABLED_ZEROONE: !!process.env.ZEROONE_API_KEY,
      ZEROONE_API_KEY: process.env.ZEROONE_API_KEY,

      ENABLED_AWS_BEDROCK: process.env.ENABLED_AWS_BEDROCK === '1',
      AWS_REGION: process.env.AWS_REGION,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,

      ENABLED_OLLAMA: process.env.ENABLED_OLLAMA !== '0',
      OLLAMA_PROXY_URL: process.env.OLLAMA_PROXY_URL || '',
      OLLAMA_MODEL_LIST: process.env.OLLAMA_MODEL_LIST,

      ENABLED_QWEN: !!process.env.QWEN_API_KEY,
      QWEN_API_KEY: process.env.QWEN_API_KEY,

      ENABLED_STEPFUN: !!process.env.STEPFUN_API_KEY,
      STEPFUN_API_KEY: process.env.STEPFUN_API_KEY,

      ENABLED_NOVITA: !!process.env.NOVITA_API_KEY,
      NOVITA_API_KEY: process.env.NOVITA_API_KEY,

      ENABLED_BAICHUAN: !!process.env.BAICHUAN_API_KEY,
      BAICHUAN_API_KEY: process.env.BAICHUAN_API_KEY,

      ENABLED_TAICHU: !!process.env.TAICHU_API_KEY,
      TAICHU_API_KEY: process.env.TAICHU_API_KEY,

      ENABLED_AI360: !!process.env.AI360_API_KEY,
      AI360_API_KEY: process.env.AI360_API_KEY,

      ENABLED_SILICONCLOUD: !!process.env.SILICONCLOUD_API_KEY,
      SILICONCLOUD_API_KEY: process.env.SILICONCLOUD_API_KEY,
      SILICONCLOUD_MODEL_LIST: process.env.SILICONCLOUD_MODEL_LIST,
      SILICONCLOUD_PROXY_URL: process.env.SILICONCLOUD_PROXY_URL,
    },
  });
};

export const llmEnv = getLLMConfig();
