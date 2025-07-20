import { z } from 'zod';

// Request schemas
export const MessageTranslateQueryRequestSchema = z.object({
  messageId: z.string().min(1, '消息ID不能为空'),
});

export const MessageTranslateTriggerRequestSchema = z.object({
  from: z.string(),
  messageId: z.string().min(1, '消息ID不能为空'),
  to: z.string().min(1, '目标语言不能为空'),
});

export const MessageTranslateInfoUpdateSchema = z.object({
  from: z.string(),
  to: z.string().min(1, '目标语言不能为空'),
  translatedContent: z.string().min(1, '翻译内容不能为空'),
});

// TypeScript types
export interface MessageTranslateQueryRequest {
  messageId: string;
}

export interface MessageTranslateTriggerRequest {
  from: string;
  messageId: string;
  to: string;
}

export interface MessageTranslateInfoUpdate {
  from: string;
  messageId: string;
  to: string;
  translatedContent: string;
}

// Response type (represents the message_translates table structure)
export interface MessageTranslateResponse {
  clientId: string | null;
  content: string | null;
  from: string | null;
  id: string;
  to: string | null;
  userId: string;
}
