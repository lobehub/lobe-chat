import { z } from 'zod';

import { AgentSchema } from '@/database/client/schemas/session';
import { LobeMetaDataSchema } from '@/types/meta';

const settingsSchema = z.object({
  defaultAgent: z.object({
    config: AgentSchema,
    meta: LobeMetaDataSchema,
  }),
  fontSize: z.number().default(14),
  language: z.string(),
  languageModel: z.any().optional(),
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

export const DB_UserSchema = z.object({
  avatar: z.string().optional(),
  settings: settingsSchema.partial(),
  uuid: z.string(),
});

export type DB_User = z.infer<typeof DB_UserSchema>;

export type DB_Settings = z.infer<typeof settingsSchema>;
