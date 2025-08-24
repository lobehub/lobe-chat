import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getAllScopePermissions } from '@/utils/rbac';

import { MessageTranslateController } from '../controllers';
import { requireAuth } from '../middleware';
import { requireAnyPermission } from '../middleware/permission-check';
import {
  MessageTranslateInfoUpdateSchema,
  MessageTranslateQueryRequestSchema,
  MessageTranslateTriggerRequestSchema,
} from '../types/message-translations.type';

// Message Translate 相关路由
const MessageTranslatesRoutes = new Hono();

// POST /api/v1/message-translates - 翻译指定消息
MessageTranslatesRoutes.post(
  '/:messageId',
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('MESSAGE_READ'),
    'You do not have permission to read translated message',
  ),
  requireAnyPermission(
    getAllScopePermissions('MESSAGE_CREATE'),
    'You do not have permission to translate message',
  ),
  zValidator('param', MessageTranslateQueryRequestSchema),
  zValidator('json', MessageTranslateTriggerRequestSchema),
  (c) => {
    const controller = new MessageTranslateController();
    return controller.handleTranslateMessage(c);
  },
);

// GET /api/v1/message-translates - 获取指定消息的翻译信息
MessageTranslatesRoutes.get(
  '/:messageId',
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('MESSAGE_READ'),
    'You do not have permission to read message translations',
  ),
  requireAnyPermission(
    getAllScopePermissions('MESSAGE_TRANSLATE_READ'),
    'You do not have permission to read message translations',
  ),
  zValidator('param', MessageTranslateQueryRequestSchema),
  (c) => {
    const controller = new MessageTranslateController();
    return controller.handleGetTranslateByMessage(c);
  },
);

// PUT /api/v1/message-translates/:messageId - 更新消息翻译信息
MessageTranslatesRoutes.put(
  '/:messageId',
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('MESSAGE_UPDATE'),
    'You do not have permission to update translation configuration',
  ),
  requireAnyPermission(
    getAllScopePermissions('MESSAGE_TRANSLATE_UPDATE'),
    'You do not have permission to update message translations',
  ),
  zValidator('param', MessageTranslateQueryRequestSchema),
  zValidator('json', MessageTranslateInfoUpdateSchema),
  (c) => {
    const controller = new MessageTranslateController();
    return controller.handleUpdateTranslateInfo(c);
  },
);

export default MessageTranslatesRoutes;
