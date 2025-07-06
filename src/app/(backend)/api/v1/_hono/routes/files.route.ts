import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { FileController } from '../controllers/file.controller';
import { requireAuth } from '../middleware/oidc-auth';
import {
  FileIdParamSchema,
  FileListQuerySchema,
  FileParseRequestSchema,
  FileUrlRequestSchema,
} from '../types/file.type';

const app = new Hono();

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
app.get('/', requireAuth, zValidator('query', FileListQuerySchema), async (c) => {
  const fileController = new FileController();
  return await fileController.getFiles(c);
});

/**
 * 单文件上传
 * POST /files/upload
 * Content-Type: multipart/form-data
 *
 * Form fields:
 * - file: File (required) - 要上传的文件
 * - knowledgeBaseId: string (optional) - 知识库ID
 * - sessionId: string (optional) - 会话ID，如果提供则创建文件和会话的关联关系
 * - skipCheckFileType: boolean (optional) - 是否跳过文件类型检查
 * - directory: string (optional) - 上传目录
 */
app.post('/upload', requireAuth, async (c) => {
  const fileController = new FileController();
  return await fileController.uploadFile(c);
});

/**
 * 批量文件上传
 * POST /files/batch-upload
 * Content-Type: multipart/form-data
 *
 * Form fields:
 * - files: File[] (required) - 要上传的文件列表
 * - knowledgeBaseId: string (optional) - 知识库ID
 * - sessionId: string (optional) - 会话ID，如果提供则创建文件和会话的关联关系
 * - skipCheckFileType: boolean (optional) - 是否跳过文件类型检查
 * - directory: string (optional) - 上传目录
 */
app.post('/batch-upload', requireAuth, async (c) => {
  const fileController = new FileController();
  return await fileController.batchUploadFiles(c);
});

/**
 * 公共文件上传
 * POST /files/upload-public
 * Content-Type: multipart/form-data
 *
 * Form fields:
 * - file: File (required) - 要上传的文件
 * - knowledgeBaseId: string (optional) - 知识库ID
 * - sessionId: string (optional) - 会话ID，如果提供则创建文件和会话的关联关系
 * - skipCheckFileType: boolean (optional) - 是否跳过文件类型检查
 * - directory: string (optional) - 上传目录
 *
 * 特点：
 * - 自动设置为公共读取权限（public-read ACL）
 * - 返回永久可访问的URL
 * - 适用于头像、公共资源等需要长期访问的文件
 */
app.post('/upload-public', requireAuth, async (c) => {
  const fileController = new FileController();
  return await fileController.uploadPublicFile(c);
});

/**
 * 获取文件详情
 * GET /files/:id
 *
 * Path parameters:
 * - id: string (required) - 文件ID
 */
app.get('/:id', requireAuth, zValidator('param', FileIdParamSchema), async (c) => {
  const fileController = new FileController();
  return await fileController.getFile(c);
});

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
  async (c) => {
    const fileController = new FileController();
    return await fileController.getFileUrl(c);
  },
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
app.get('/:id/permanent-url', requireAuth, zValidator('param', FileIdParamSchema), async (c) => {
  const fileController = new FileController();
  return await fileController.getPermanentFileUrl(c);
});

/**
 * 解析文件内容
 * POST /files/:id/parse
 *
 * Path parameters:
 * - id: string (required) - 文件ID
 *
 * Query parameters:
 * - skipExist: boolean (optional) - 是否跳过已存在的解析结果，默认false
 *
 * 功能：
 * - 解析文档文件的文本内容（PDF、Word、Excel等）
 * - 支持跳过已解析的文件，避免重复解析
 * - 返回解析后的文本内容和元数据
 */
app.post(
  '/:id/parse',
  requireAuth,
  zValidator('param', FileIdParamSchema),
  zValidator('query', FileParseRequestSchema),
  async (c) => {
    const fileController = new FileController();
    return await fileController.parseFile(c);
  },
);

/**
 * 上传文件并解析文件内容
 * POST /files/upload-and-parse
 * Content-Type: multipart/form-data
 *
 * Form fields:
 * - file: File (required) - 要上传的文件
 * - knowledgeBaseId: string (optional) - 知识库ID
 * - sessionId: string (optional) - 会话ID，如果提供则创建文件和会话的关联关系
 * - skipCheckFileType: boolean (optional) - 是否跳过文件类型检查
 * - directory: string (optional) - 上传目录
 * - skipExist: boolean (optional) - 是否跳过已存在的解析结果，默认false
 *
 * 功能：
 * - 上传文件并自动生成文件ID
 * - 同时解析文件内容
 * - 返回包含上传结果和解析结果的组合对象
 */
app.post('/upload-and-parse', requireAuth, async (c) => {
  const fileController = new FileController();
  return await fileController.uploadAndParseFile(c);
});

/**
 * 删除文件
 * DELETE /files/:id
 *
 * Path parameters:
 * - id: string (required) - 文件ID
 */
app.delete('/:id', requireAuth, zValidator('param', FileIdParamSchema), async (c) => {
  const fileController = new FileController();
  return await fileController.deleteFile(c);
});

export default app;
