import { z } from 'zod';

import { LobeMetaDataSchema } from '@/types/meta';

const fewShotsSchema = z.array(
  z.object({
    content: z.string(),
    role: z.string(),
  }),
);

const ttsSchema = z.object({
  showAllLocaleVoice: z.boolean().optional(),
  sttLocale: z.string().default('auto'),
  ttsService: z.string().default('openai'),
  voice: z
    .object({
      edge: z.string().optional(),
      microsoft: z.string().optional(),
      openai: z.string().default(''),
    })
    .optional(),
});

export const AgentSchema = z.object({
  autoCreateTopicThreshold: z.number().default(2),
  compressThreshold: z.number().optional(),
  displayMode: z.enum(['chat', 'docs']).optional(),
  enableAutoCreateTopic: z.boolean().default(true),
  enableCompressThreshold: z.boolean().optional(),
  enableHistoryCount: z.boolean().optional(),
  enableMaxTokens: z.boolean().optional(),
  fewShots: fewShotsSchema.optional(),
  historyCount: z.number().default(8).optional(),
  inputTemplate: z.string().optional(),
  model: z.string().default('gpt-3.5-turbo'),
  params: z.object({
    frequency_penalty: z.number().default(0).optional(),
    max_tokens: z.number().optional(),
    presence_penalty: z.number().default(0).optional(),
    temperature: z.number().default(0.6).optional(),
    top_p: z.number().default(1).optional(),
  }),
  plugins: z.array(z.string()).optional(),
  systemRole: z.string().default(''),
  tts: ttsSchema.optional(),
});

export const DB_SessionSchema = z.object({
  config: AgentSchema,
  group: z.string().default('default'),
  meta: LobeMetaDataSchema,
  type: z.enum(['agent', 'group']).default('agent'),
});

export type DB_Session = z.infer<typeof DB_SessionSchema>;
