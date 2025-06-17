import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getScopePermissions } from '@/utils/rbac';

import { TopicController } from '../controllers';
import { requireAuth } from '../middleware';
import { requireAnyPermission } from '../middleware/permission-check';
import {
  TopicCreateRequestSchema,
  TopicListRequestSchema,
  TopicSummaryRequestSchema,
} from '../types/topic.type';

// Topic 相关路由
const TopicsRoutes = new Hono();

// GET /api/v1/topics/list - 获取指定会话的所有话题
TopicsRoutes.get(
  '/list',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('TOPIC_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    'You do not have permission to read topics',
  ),
  zValidator('query', TopicListRequestSchema),
  (c) => {
    const controller = new TopicController();
    return controller.handleGetTopicsBySession(c);
  },
);

// POST /api/v1/topics/create - 创建新的话题
TopicsRoutes.post(
  '/create',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('TOPIC_CREATE', ['ALL', 'WORKSPACE', 'OWNER']),
    'You do not have permission to create topics',
  ),
  zValidator('json', TopicCreateRequestSchema),
  (c) => {
    const controller = new TopicController();
    return controller.handleCreateTopic(c);
  },
);

// POST /api/v1/topics/summary - 总结对应的话题
TopicsRoutes.post(
  '/summary',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('TOPIC_UPDATE', ['ALL', 'WORKSPACE', 'OWNER']),
    'You do not have permission to summarize topics',
  ),
  zValidator('json', TopicSummaryRequestSchema),
  (c) => {
    const controller = new TopicController();
    return controller.handleSummarizeTopic(c);
  },
);

export default TopicsRoutes;
