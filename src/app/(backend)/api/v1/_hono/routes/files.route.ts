import { Hono } from 'hono';

import { FileController } from '../controllers/file.controller';
import { requireAuth } from '../middleware/oidc-auth';

/**
 * 文件管理路由
 * 提供完整的文件上传和管理功能的RESTful API
 */
const fileController = new FileController();
const app = new Hono();

/**
 * 健康检查
 * GET /files/health
 */
app.get('/health', (c) => fileController.health(c));

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
 * 创建预签名URL
 * POST /files/presigned-url
 * Content-Type: application/json
 *
 * Request body:
 * {
 *   "filename": "example.pdf",
 *   "fileType": "application/pdf",
 *   "size": 1024000,
 *   "pathname": "custom/path" // optional
 * }
 */
app.post('/presigned-url', requireAuth, (c) => fileController.createPreSignedUrl(c));

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
app.get('/', requireAuth, (c) => fileController.getFiles(c));

/**
 * 获取文件详情
 * GET /files/:id
 *
 * Path parameters:
 * - id: string (required) - 文件ID
 */
app.get('/:id', requireAuth, (c) => fileController.getFile(c));

/**
 * 删除文件
 * DELETE /files/:id
 *
 * Path parameters:
 * - id: string (required) - 文件ID
 */
app.delete('/:id', requireAuth, (c) => fileController.deleteFile(c));

export default app;
