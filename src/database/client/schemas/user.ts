import { z } from 'zod';

import { AgentSchema } from '@/database/client/schemas/session';
import { LobeMetaDataSchema } from '@/types/meta';

const generalSechma = z.object({
  fontSize: z.number().default(14),
  language: z.string(),
  neutralColor: z.string().optional(),
  password: z.string(),
  themeMode: z.string(),
});

const settingsSchema = z.object({
  defaultAgent: z.object({
    config: AgentSchema,
    meta: LobeMetaDataSchema,
  }),
  general: generalSechma.partial().optional(),
  keyVaults: z.any().optional(),
  languageModel: z.any().optional(),
  tts: z.object({
    openAI: z.object({
      sttModel: z.string(),
      ttsModel: z.string(),
    }),
    sttAutoStop: z.boolean(),
    sttServer: z.string(),
  }),
});

export const DB_UserSchema = z.object({
  avatar: z.string().optional(),
  settings: settingsSchema.partial(),
  uuid: z.string(),
});

export type DB_User = z.infer<typeof DB_UserSchema>;

export type DB_Settings = z.infer<typeof settingsSchema>;
