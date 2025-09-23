import { z } from 'zod';

import { SessionGroupItem } from '@/database/schemas';

// ==================== Session Group CRUD Types ====================

/**
 * 创建会话组请求参数
 */
export interface CreateSessionGroupRequest {
  name: string;
  sort?: number;
}

export const CreateSessionGroupRequestSchema = z.object({
  name: z.string().min(1, '会话组名称不能为空'),
  sort: z.number().nullish(),
});

/**
 * 更新会话组请求参数
 */
export interface UpdateSessionGroupRequest {
  id: string;
  name?: string;
  sort?: number;
}

export const UpdateSessionGroupRequestSchema = z.object({
  name: z.string().min(1, '会话组名称不能为空').nullish(),
  sort: z.number().nullish(),
});

/**
 * 删除会话组请求参数
 */
export interface DeleteSessionGroupRequest {
  id: string;
}

// ==================== Session Group Response Types ====================

/**
 * 会话组列表响应类型
 */
export type SessionGroupListResponse = SessionGroupItem[];

// ==================== Common Schemas ====================

export const SessionGroupIdParamSchema = z.object({
  id: z.string().min(1, '会话组 ID 不能为空'),
});
