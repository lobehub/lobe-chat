import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { ChatController } from '../controllers/chat.controller';
import {
  ChatServiceParamsSchema,
  MessageGenerationParamsSchema,
  TranslateServiceParamsSchema,
} from '../types/chat.type';

const app = new Hono();

// 通用聊天接口
app.post('/', zValidator('json', ChatServiceParamsSchema), async (c) => {
  const chatController = new ChatController();
  return (await chatController.handleChat(c)) as Response;
});

// 翻译接口
app.post('/translate', zValidator('json', TranslateServiceParamsSchema), async (c) => {
  const chatController = new ChatController();
  return await chatController.handleTranslate(c);
});

// 生成回复接口
app.post('/generate-reply', zValidator('json', MessageGenerationParamsSchema), async (c) => {
  const chatController = new ChatController();
  return await chatController.handleGenerateReply(c);
});

export default app;
