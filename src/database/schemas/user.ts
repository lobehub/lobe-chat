import { z } from 'zod';

import { AgentSchema } from '@/database/schemas/session';
import { LobeMetaDataSchema } from '@/types/meta';

const modelProviderSchema = z.object({
  openai: z.object({
    OPENAI_API_KEY: z.string().optional(),
    azureApiVersion: z.string().optional(),
    customModelName: z.string().optional(),
    endpoint: z.string().optional(),
    models: z.array(z.string()).optional(),
    useAzure: z.boolean().optional(),
  }),
  // zhipu: z.object({
  //   ZHIPU_API_KEY: z.string().optional(),
  //   enabled: z.boolean().default(false),
  // }),
});

const settingsSchema = z.object({
  defaultAgent: z.object({
    config: AgentSchema,
    meta: LobeMetaDataSchema,
  }),
  fontSize: z.number().default(14),
  language: z.string(),
  languageModel: modelProviderSchema.partial(),
  password: z.string(),
  themeMode: z.string(),
  tts: z.object({
    openAI: z.object({
      sttModel: z.string(),
      ttsModel: z.string(),
    }),
    sttAutoStop: z.boolean(),
    sttServer: z.string(),
  }),
});

// const patchSchema = z.array(
//   z.object({
//     op: z.string(),
//     path: z.string(),
//     value: z.any(),
//   }),
// );

export const DB_UserSchema = z.object({
  avatar: z.string().optional(),
  settings: settingsSchema.partial(),
  uuid: z.string(),
  // settings: patchSchema,
});

export type DB_User = z.infer<typeof DB_UserSchema>;

export type DB_Settings = z.infer<typeof settingsSchema>;
