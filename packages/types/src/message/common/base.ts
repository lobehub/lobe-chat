import type { ILobeAgentRuntimeErrorType } from '@lobechat/model-runtime';
import type { IPluginErrorType } from '@lobehub/chat-plugin-sdk';
import { z } from 'zod';

import { ErrorType } from '../../fetch';

/**
 * 聊天消息错误对象
 */
export interface ChatMessageError {
  body?: any;
  message?: string;
  type: ErrorType | IPluginErrorType | ILobeAgentRuntimeErrorType;
}

export const ChatMessageErrorSchema = z.object({
  body: z.any().optional(),
  message: z.string().optional(),
  type: z.union([z.string(), z.number()]),
});

export interface ChatCitationItem {
  id?: string;
  onlyUrl?: boolean;
  title?: string;
  url: string;
}

export interface ModelReasoning {
  content?: string;
  duration?: number;
  signature?: string;
}

export const ModelReasoningSchema = z.object({
  content: z.string().optional(),
  duration: z.number().optional(),
  signature: z.string().optional(),
});
