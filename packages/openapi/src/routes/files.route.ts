import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getAllScopePermissions } from '@/utils/rbac';

import { FileController } from '../controllers/file.controller';
import { requireAnyPermission } from '../middleware';
import { requireAuth } from '../middleware/auth';
import {
  BatchGetFilesRequestSchema,
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
 * - search: string (optional) - 搜索关键词
 * - userId: string (optional) - 用户ID，如果提供则获取指定用户文件
 */
app.get(
  '/',
  requireAuth,
  requireAnyPermission(getAllScopePermissions('FILE_READ'), '您没有权限查看文件列表'),
  zValidator('query', FileListQuerySchema),
  async (c) => {
    const fileController = new FileController();
    return await fileController.getFiles(c);
  },
);

/**
 * 文件上传并返回相应的文件
 * 文件的 URL 根据 S3 类型自动生成，是否可以访问取决于 S3 的权限设置
 * POST /files
 * Content-Type: multipart/form-data
 *
 * Form fields:
 * - file: File (required) - 要上传的文件
 * - knowledgeBaseId: string (optional) - 知识库ID
 * - sessionId: string (optional) - 会话ID，如果提供则创建文件和会话的关联关系
 * - skipCheckFileType: boolean (optional) - 是否跳过文件类型检查
 * - directory: string (optional) - 上传目录
 * - skipExist: boolean (optional) - 是否跳过已存在的解析结果，默认false
 */
app.post(
  '/',
  requireAuth,
  requireAnyPermission(getAllScopePermissions('FILE_UPDATE'), '您没有权限上传文件'),
  async (c) => {
    const fileController = new FileController();
    return await fileController.uploadFile(c);
  },
);

/**
 * 获取文件详情
 * GET /files/:id
 *
 * Path parameters:
 * - id: string (required) - 文件ID
 */
app.get(
  '/:id',
  requireAuth,
  requireAnyPermission(getAllScopePermissions('FILE_READ'), '您没有权限获取文件详情'),
  zValidator('param', FileIdParamSchema),
  async (c) => {
    const fileController = new FileController();
    return await fileController.getFile(c);
  },
);

/**
 * 获取文件访问URL
 * GET /files/:id/url
 *
 * Path parameters:
 * - id: string (required) - 文件ID
 *
 * Query parameters:
 * - expiresIn: number (optional) - URL过期时间（秒），默认3600
 */
app.get(
  '/:id/url',
  requireAuth,
  requireAnyPermission(getAllScopePermissions('FILE_READ'), '您没有权限获取文件访问URL'),
  zValidator('param', FileIdParamSchema),
  zValidator('query', FileUrlRequestSchema),
  async (c) => {
    const fileController = new FileController();
    return await fileController.getFileUrl(c);
  },
);

/**
 * 删除文件
 * DELETE /files/:id
 *
 * Path parameters:
 * - id: string (required) - 文件ID
 */
app.delete(
  '/:id',
  requireAuth,
  requireAnyPermission(getAllScopePermissions('FILE_DELETE'), '您没有权限删除文件'),
  zValidator('param', FileIdParamSchema),
  async (c) => {
    const fileController = new FileController();
    return await fileController.deleteFile(c);
  },
);

/**
 * 解析文件内容
 * POST /files/:id/parses
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
  '/:id/parses',
  requireAuth,
  requireAnyPermission(getAllScopePermissions('FILE_UPDATE'), '您没有权限解析文件内容'),
  zValidator('param', FileIdParamSchema),
  zValidator('query', FileParseRequestSchema),
  async (c) => {
    const fileController = new FileController();
    return await fileController.parseFile(c);
  },
);

/**
 * 批量文件上传
 * POST /files/batches
 * Content-Type: multipart/form-data
 *
 * Form fields:
 * - files: File[] (required) - 要上传的文件列表
 * - knowledgeBaseId: string (optional) - 知识库ID
 * - sessionId: string (optional) - 会话ID，如果提供则创建文件和会话的关联关系
 * - skipCheckFileType: boolean (optional) - 是否跳过文件类型检查
 * - directory: string (optional) - 上传目录
 * - skipExist: boolean (optional) - 是否跳过已存在的解析结果，默认false
 */
// app.post(
//   '/batches',
//   requireAuth,
//   requireAnyPermission(getAllScopePermissions('FILE_UPDATE'), '您没有权限批量上传文件'),
//   async (c) => {
//     const fileController = new FileController();
//     return await fileController.batchUploadFiles(c);
//   },
// );

/**
 * 批量获取文件详情
 * POST /files/queries
 * Content-Type: application/json
 *
 * Request body:
 * {
 *   "fileIds": ["file1", "file2", "file3"]
 * }
 *
 * 功能：
 * - 根据文件ID列表批量获取文件详情
 * - 返回成功和失败的统计信息
 */
app.post(
  '/queries',
  requireAuth,
  requireAnyPermission(getAllScopePermissions('FILE_READ'), '您没有权限批量获取文件详情'),
  zValidator('json', BatchGetFilesRequestSchema),
  async (c) => {
    const fileController = new FileController();
    return await fileController.queries(c);
  },
);

export default app;
