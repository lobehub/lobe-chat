import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { MessageController } from '../controllers';
import { requireAuth } from '../middleware';

// 参数校验 Schema
const countByTopicsSchema = z.object({
  topicIds: z.array(z.string()).min(1, '话题ID数组不能为空'),
});

const countByUserSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
});

// Topic 相关路由
const MessageRoutes = new Hono();

// GET /api/v1/message - 获取示例数据
MessageRoutes.get('/', requireAuth, (c) => {
  const controller = new MessageController();

  return controller.handleGetExample(c);
});

// POST /api/v1/message/count/by-topics - 根据话题ID数组统计消息数量
MessageRoutes.post(
  '/count/by-topics',
  requireAuth,
  zValidator('json', countByTopicsSchema),
  (c) => {
    const controller = new MessageController();
    return controller.handleCountMessagesByTopics(c);
  },
);

// POST /api/v1/message/count/by-user - 根据用户ID统计消息数量
MessageRoutes.post('/count/by-user', requireAuth, zValidator('json', countByUserSchema), (c) => {
  const controller = new MessageController();
  return controller.handleCountMessagesByUser(c);
});

export default MessageRoutes;
