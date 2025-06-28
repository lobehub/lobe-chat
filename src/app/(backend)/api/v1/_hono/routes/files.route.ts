import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { FileController } from '../controllers/file.controller';
import { requireAuth } from '../middleware/oidc-auth';
import { FileIdParamSchema, FileListQuerySchema, FileUrlRequestSchema } from '../types/file.type';

/**
 * 文件管理路由
 * 提供完整的文件上传和管理功能的RESTful API
 */
const fileController = new FileController();
const app = new Hono();

/**
 * 单文件上传
 * POST /files/upload
 * Content-Type: multipart/form-data
 *
 * Form fields:
 * - file: File (required) - 要上传的文件
 * - knowledgeBaseId: string (optional) - 知识库ID
 * - skipCheckFileType: boolean (optional) - 是否跳过文件类型检查
 * - directory: string (optional) - 上传目录
 */
app.post('/upload', requireAuth, (c) => fileController.uploadFile(c));

/**
 * 公共文件上传
 * POST /files/upload-public
 * Content-Type: multipart/form-data
 *
 * Form fields:
 * - file: File (required) - 要上传的文件
 * - knowledgeBaseId: string (optional) - 知识库ID
 * - skipCheckFileType: boolean (optional) - 是否跳过文件类型检查
 * - directory: string (optional) - 上传目录
 *
 * 特点：
 * - 自动设置为公共读取权限（public-read ACL）
 * - 返回永久可访问的URL
 * - 适用于头像、公共资源等需要长期访问的文件
 */
app.post('/upload-public', requireAuth, (c) => fileController.uploadPublicFile(c));

/**
 * 批量文件上传
 * POST /files/batch-upload
 * Content-Type: multipart/form-data
 *
 * Form fields:
 * - files: File[] (required) - 要上传的文件列表
 * - knowledgeBaseId: string (optional) - 知识库ID
 * - skipCheckFileType: boolean (optional) - 是否跳过文件类型检查
 * - directory: string (optional) - 上传目录
 */
app.post('/batch-upload', requireAuth, (c) => fileController.batchUploadFiles(c));

/**
 * 获取文件列表
 * GET /files
 *
 * Query parameters:
 * - page: number (optional) - 页码，默认1
 * - pageSize: number (optional) - 每页数量，默认20，最大100
 * - fileType: string (optional) - 文件类型过滤
 * - knowledgeBaseId: string (optional) - 知识库ID过滤
 * - search: string (optional) - 搜索关键词
 */
app.get('/', requireAuth, zValidator('query', FileListQuerySchema), (c) =>
  fileController.getFiles(c),
);

/**
 * 获取文件详情
 * GET /files/:id
 *
 * Path parameters:
 * - id: string (required) - 文件ID
 */
app.get('/:id', requireAuth, zValidator('param', FileIdParamSchema), (c) =>
  fileController.getFile(c),
);

/**
 * 获取文件访问URL
 * GET /files/:id/url
 *
 * Path parameters:
 * - id: string (required) - 文件ID
 *
 * Query parameters:
 * - expiresIn: number (optional) - URL过期时间（秒），范围60-7200，默认3600
 */
app.get(
  '/:id/url',
  requireAuth,
  zValidator('param', FileIdParamSchema),
  zValidator('query', FileUrlRequestSchema),
  (c) => fileController.getFileUrl(c),
);

/**
 * 获取文件永久访问URL
 * GET /files/:id/permanent-url
 *
 * Path parameters:
 * - id: string (required) - 文件ID
 *
 * 特点：
 * - 返回永久可访问的公共URL
 * - 适用于头像等需要长期访问的文件
 * - 需要文件设置了public-read ACL
 */
app.get('/:id/permanent-url', requireAuth, zValidator('param', FileIdParamSchema), (c) =>
  fileController.getPermanentFileUrl(c),
);

/**
 * 删除文件
 * DELETE /files/:id
 *
 * Path parameters:
 * - id: string (required) - 文件ID
 */
app.delete('/:id', requireAuth, zValidator('param', FileIdParamSchema), (c) =>
  fileController.deleteFile(c),
);

export default app;
