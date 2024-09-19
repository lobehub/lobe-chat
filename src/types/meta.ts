import { z } from 'zod';

export const LobeMetaDataSchema = z.object({
  /**
   * 角色头像
   */
  avatar: z.string().optional(),
  /**
   *  背景色
   */
  backgroundColor: z.string().optional(),
  description: z.string().optional(),

  tags: z.array(z.string()).optional(),
  /**
   * 名称
   */
  title: z.string().optional(),
});

export type MetaData = z.infer<typeof LobeMetaDataSchema>;

export interface BaseDataModel {
  /**
   * @deprecated
   */
  createAt?: number;

  createdAt: number;

  id: string;
  meta: MetaData;

  /**
   * @deprecated
   */
  updateAt?: number;
  updatedAt: number;
}
