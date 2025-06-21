import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getScopePermissions } from '@/utils/rbac';

import { MessageTranslateController } from '../controllers';
import { requireAuth } from '../middleware';
import { requireAnyPermission } from '../middleware/permission-check';
import {
  MessageTranslateQueryRequestSchema,
  MessageTranslateTriggerRequestSchema,
} from '../types/message-translate.type';

// Message Translate 相关路由
const MessageTranslatesRoutes = new Hono();

// GET /api/v1/message-translates - 获取指定消息的翻译信息
MessageTranslatesRoutes.get(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('MESSAGE_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    'You do not have permission to read message translations',
  ),
  zValidator('query', MessageTranslateQueryRequestSchema),
  (c) => {
    const controller = new MessageTranslateController();
    return controller.handleGetTranslateByMessage(c);
  },
);

// POST /api/v1/message-translates - 翻译指定消息
MessageTranslatesRoutes.post(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('MESSAGE_UPDATE', ['ALL', 'WORKSPACE', 'OWNER']),
    'You do not have permission to translate messages',
  ),
  zValidator('json', MessageTranslateTriggerRequestSchema),
  (c) => {
    const controller = new MessageTranslateController();
    return controller.handleTranslateMessage(c);
  },
);

export default MessageTranslatesRoutes;
