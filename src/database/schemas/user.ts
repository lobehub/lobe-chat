import { z } from 'zod';

import { AgentSchema } from './session';

const modelProviderSchema = z.object({
  openai: z.object({
    OPENAI_API_KEY: z.string(),
    azureApiVersion: z.string().optional(),
    customModelName: z.string().optional(),
    endpoint: z.string().optional(),
    models: z.array(z.string()).optional(),
    useAzure: z.boolean().optional(),
  }),
});

const settingsSchema = z.object({
  defaultAgent: AgentSchema,
  fontSize: z.number().default(14),
  language: z.string(),
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
  /**
   * file data array buffer
   */
  avatar: z.instanceof(ArrayBuffer),
});

export type DB_Topic = z.infer<typeof DB_UserSchema>;
