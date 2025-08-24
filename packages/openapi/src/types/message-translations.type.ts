import { z } from 'zod';

// 翻译消息查询请求参数
export const MessageTranslateQueryRequestSchema = z.object({
  messageId: z.string().min(1, 'message id is required'),
});

// 翻译消息触发请求参数
export const MessageTranslateTriggerRequestSchema = z.object({
  from: z.string(),
  to: z.string().min(1, 'target language is required, e.g. en-US, zh-CN'),
});

// 更新翻译信息请求参数
export const MessageTranslateInfoUpdateSchema = MessageTranslateTriggerRequestSchema.extend({
  translatedContent: z.string().min(1, 'translated content is required'),
});

// 翻译消息请求参数
export interface MessageTranslateQueryRequest {
  messageId: string;
}

// 翻译消息 params 请求参数
export type MessageTranslateParams = MessageTranslateQueryRequest;

// 翻译消息 body 请求参数
export interface MessageTranslateBody {
  from: string;
  to: string;
}

// 翻译消息完整请求参数
export type MessageTranslateTriggerRequest = MessageTranslateQueryRequest & MessageTranslateBody;

// 更新翻译信息请求参数
export type MessageTranslateInfoUpdate = MessageTranslateTriggerRequest & {
  translatedContent: string;
};

// 翻译消息响应参数
export interface MessageTranslateResponse {
  clientId: string | null;
  content: string | null;
  from: string | null;
  id: string;
  to: string | null;
  userId: string;
}
