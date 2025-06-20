import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { ChatController } from '../controllers/chat.controller';
import {
  ChatServiceParamsSchema,
  MessageGenerationParamsSchema,
  TranslateServiceParamsSchema,
} from '../types/chat.type';

const app = new Hono();
const chatController = new ChatController();

// 通用聊天接口
app.post('/', zValidator('json', ChatServiceParamsSchema), (c) =>
  // @ts-ignore
  chatController.handleChat(c),
);

// 翻译接口
app.post('/translate', zValidator('json', TranslateServiceParamsSchema), (c) =>
  chatController.handleTranslate(c),
);

// 生成回复接口
app.post('/generate-reply', zValidator('json', MessageGenerationParamsSchema), (c) =>
  chatController.handleGenerateReply(c),
);

// 健康检查接口
app.get('/health', (c) => chatController.handleHealthCheck(c));

export default app;
