import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { ChatController } from '../controllers/chat.controller';

const app = new Hono();
const chatController = new ChatController();

// 聊天参数验证schema
const chatRequestSchema = z.object({
  max_tokens: z.number().positive().optional(),
  messages: z.array(
    z.object({
      content: z.string(),
      role: z.enum(['user', 'assistant', 'system']),
    }),
  ),
  model: z.string().optional(),
  provider: z.string().optional(),
  stream: z.boolean().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

// 翻译参数验证schema
const translateRequestSchema = z.object({
  fromLanguage: z.string().optional(),
  model: z.string().optional(),
  provider: z.string().optional(),
  text: z.string().min(1),
  toLanguage: z.string().min(1),
});

// 消息生成参数验证schema
const generateReplyRequestSchema = z.object({
  agentId: z.string().optional(),
  conversationHistory: z.array(
    z.object({
      content: z.string(),
      role: z.enum(['user', 'assistant', 'system']),
    }),
  ),
  model: z.string().optional(),
  provider: z.string().optional(),
  sessionId: z.string().optional(),
  userMessage: z.string().min(1),
});

// 通用聊天接口
app.post('/', zValidator('json', chatRequestSchema), (c) =>
  // @ts-ignore
  chatController.handleChat(c),
);

// 翻译接口
app.post('/translate', zValidator('json', translateRequestSchema), (c) =>
  chatController.handleTranslate(c),
);

// 生成回复接口
app.post('/generate-reply', zValidator('json', generateReplyRequestSchema), (c) =>
  chatController.handleGenerateReply(c),
);

// 健康检查接口
app.get('/health', (c) => chatController.handleHealthCheck(c));

export default app;
