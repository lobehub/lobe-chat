import { z } from 'zod';

/**
 * 获取模型详情请求参数 Schema
 */
export const GetModelDetailsRequestSchema = z.object({
  model: z.string().min(1, '模型名称不能为空'),
  provider: z.string().min(1, '提供商名称不能为空'),
});

/**
 * 模型详情响应数据结构
 */
export interface ModelDetailsResponse {
  /** 模型上下文窗口token数量 */
  contextWindowTokens?: number | null;
  /** 是否有上下文窗口token */
  hasContextWindowToken: boolean;
  /** 模型ID */
  model: string;
  /** 提供商ID */
  provider: string;
  /** 是否支持文件 */
  supportFiles: boolean;
  /** 是否支持推理 */
  supportReasoning: boolean;
  /** 是否支持工具使用 */
  supportToolUse: boolean;
  /** 是否支持视觉 */
  supportVision: boolean;
}

/**
 * 获取模型详情请求参数类型
 */
export type GetModelDetailsRequest = z.infer<typeof GetModelDetailsRequestSchema>;
