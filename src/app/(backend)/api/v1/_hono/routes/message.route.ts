import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { RBAC_PERMISSIONS } from '@/const/rbac';
import { getAllScopePermissions, getScopePermissions } from '@/utils/rbac';

import { MessageController } from '../controllers';
import { requireAuth } from '../middleware';
import { requireAnyPermission } from '../middleware/permission-check';
import {
  CountByTopicsRequestSchema,
  CountByUserRequestSchema,
  MessagesCreateRequestSchema,
  MessagesQueryByTopicRequestSchema,
} from '../types/message.type';

// Topic 相关路由
const MessageRoutes = new Hono();

// POST /api/v1/message/count/by-topics - 根据话题ID数组统计消息数量 (需要消息读取权限)
MessageRoutes.post(
  '/count/by-topics',
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('MESSAGE_READ'),
    'You do not have permission to read message statistics',
  ),
  zValidator('json', CountByTopicsRequestSchema),
  (c) => {
    const controller = new MessageController();
    return controller.handleCountMessagesByTopics(c);
  },
);

// POST /api/v1/message/count/by-user - 根据用户ID统计消息数量 (仅管理员权限)
MessageRoutes.post(
  '/count/by-user',
  requireAuth,
  requireAnyPermission(
    [RBAC_PERMISSIONS.MESSAGE_READ_ALL],
    'You do not have permission to read user message statistics',
  ),
  zValidator('json', CountByUserRequestSchema),
  (c) => {
    const controller = new MessageController();
    return controller.handleCountMessagesByUser(c);
  },
);

// GET /api/v1/messages/queryByTopic - 根据话题ID获取消息列表 (需要消息读取权限)
MessageRoutes.get(
  '/queryByTopic/:topicId',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('MESSAGE_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    'You do not have permission to read messages',
  ),
  zValidator('param', MessagesQueryByTopicRequestSchema),
  (c) => {
    const controller = new MessageController();
    return controller.handleGetMessagesByTopic(c);
  },
);

// POST /api/v1/messages - 创建新消息 (需要消息写入权限)
MessageRoutes.post(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('MESSAGE_CREATE', ['ALL', 'WORKSPACE', 'OWNER']),
    'You do not have permission to create messages',
  ),
  zValidator('json', MessagesCreateRequestSchema),
  (c) => {
    const controller = new MessageController();
    return controller.handleCreateMessage(c);
  },
);

// POST /api/v1/messages/reply - 创建用户消息并生成AI回复 (需要消息写入权限)
MessageRoutes.post(
  '/reply',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('MESSAGE_CREATE', ['ALL', 'WORKSPACE', 'OWNER']),
    'You do not have permission to create messages with AI reply',
  ),
  zValidator('json', MessagesCreateRequestSchema),
  (c) => {
    const controller = new MessageController();
    return controller.handleCreateMessageWithAIReply(c);
  },
);

export default MessageRoutes;
