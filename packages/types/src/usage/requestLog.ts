import { z } from 'zod';

import { SpendLogItem } from '@/database/schemas';

import { ChatModelPricing } from '../aiModel';
import { MessageMetadata } from '../message';

export interface RequestLog {
  /**
   * 请求标识
   */
  callType: 'chat' | 'history_summary';
  /**
   * 用量信息
   */
  metadata?: MessageMetadata;
  /**
   * 模型信息
   */
  model: string;
  /**
   * 费用
   */
  pricing?: ChatModelPricing;
  provider: string;
}

export const RequestLogSchema = z.object({
  callType: z.enum(['chat', 'history_summary']),
  metadata: z.any().optional(),
  model: z.string(),
  provider: z.string(),
  spend: z.number(),
});

export type UsageLog = {
  date: number;
  day: string;
  requestLogs: SpendLogItem[];
  totalRequests: number;
  totalSpend: number;
  totalTokens: number;
};
