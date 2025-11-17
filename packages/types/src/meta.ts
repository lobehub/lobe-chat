import { z } from 'zod';

export const LobeMetaDataSchema = z.object({
  /**
   * Character avatar
   */
  avatar: z.string().optional(),
  /**
   *  Background color
   */
  backgroundColor: z.string().optional(),
  description: z.string().optional(),
  /**
   * Market agent identifier for published agents
   */
  marketIdentifier: z.string().optional(),

  tags: z.array(z.string()).optional(),
  /**
   * Name
   */
  title: z.string().optional(),
});

export type MetaData = z.infer<typeof LobeMetaDataSchema>;

export interface BaseDataModel {
  createdAt: number;

  id: string;
  meta: MetaData;

  updatedAt: number;
}
