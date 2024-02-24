import { z } from 'zod';

export type DBModel<T> = T & {
  createdAt: number;
  id: string;
  updatedAt: number;
};

export const DBBaseFieldsSchema = z.object({
  createdAt: z.number(),
  id: z.string(),
  updatedAt: z.number(),
});

export const LOBE_CHAT_LOCAL_DB_NAME = 'LOBE_CHAT_DB';
