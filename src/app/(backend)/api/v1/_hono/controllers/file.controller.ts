import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { FileUploadService } from '../services/file.service';
import {
  BatchFileUploadRequest,
  FileListQuery,
  FileUploadRequest,
  PreSignedUrlRequest,
} from '../types/file.type';

/**
 * 文件上传控制器
 * 处理文件上传相关的HTTP请求
 */
export class FileController extends BaseController {
  /**
   * 单文件上传
   * POST /files/upload
   */
  async uploadFile(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId);

      // 处理 multipart/form-data
      const formData = await c.req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return this.error(c, 'No file provided', 400);
      }

      // 获取其他参数
      const knowledgeBaseId = formData.get('knowledgeBaseId') as string | null;
      const skipCheckFileType = formData.get('skipCheckFileType') === 'true';
      const directory = formData.get('directory') as string | null;

      const options: Partial<FileUploadRequest> = {
        directory: directory || undefined,
        knowledgeBaseId: knowledgeBaseId || undefined,
        skipCheckFileType,
      };

      const result = await fileService.uploadFile(file, options);

      return this.success(c, result, 'File uploaded successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 批量文件上传
   * POST /files/batch-upload
   */
  async batchUploadFiles(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId);

      // 处理 multipart/form-data
      const formData = await c.req.formData();
      const files: File[] = [];

      // 收集所有文件
      for (const [key, value] of formData.entries()) {
        if (key === 'files' && value instanceof File) {
          files.push(value);
        }
      }

      if (files.length === 0) {
        return this.error(c, 'No files provided', 400);
      }

      // 获取其他参数
      const knowledgeBaseId = formData.get('knowledgeBaseId') as string | null;
      const skipCheckFileType = formData.get('skipCheckFileType') === 'true';
      const directory = formData.get('directory') as string | null;

      const request: BatchFileUploadRequest = {
        directory: directory || undefined,
        files,
        knowledgeBaseId: knowledgeBaseId || undefined,
        skipCheckFileType,
      };

      const result = await fileService.uploadFiles(request);

      return this.success(
        c,
        result,
        `Batch upload completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 创建预签名URL
   * POST /files/presigned-url
   */
  async createPreSignedUrl(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在

      const body = await this.getBody<PreSignedUrlRequest>(c);
      if (!body) {
        return this.error(c, 'Invalid request body', 400);
      }

      // 验证必填字段
      if (!body.filename || !body.fileType || !body.size) {
        return this.error(c, 'Missing required fields: filename, fileType, size', 400);
      }

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId);

      const result = await fileService.createPreSignedUrl(body);

      return this.success(c, result, 'Pre-signed URL created successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取文件列表
   * GET /files
   */
  async getFiles(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在

      const query = this.getQuery(c);

      // 解析查询参数
      const fileListQuery: FileListQuery = {
        fileType: query.fileType as string,
        knowledgeBaseId: query.knowledgeBaseId as string,
        page: query.page ? parseInt(query.page as string, 10) : undefined,
        pageSize: query.pageSize ? parseInt(query.pageSize as string, 10) : undefined,
        search: query.search as string,
      };

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId);

      const result = await fileService.getFileList(fileListQuery);

      return this.success(c, result, 'Files retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取单个文件详情
   * GET /files/:id
   */
  async getFile(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在

      const { id } = this.getParams(c);
      if (!id) {
        return this.error(c, 'File ID is required', 400);
      }

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId);

      const result = await fileService.getFileDetail(id);

      return this.success(c, result, 'File details retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 删除文件
   * DELETE /files/:id
   */
  async deleteFile(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在

      const { id } = this.getParams(c);
      if (!id) {
        return this.error(c, 'File ID is required', 400);
      }

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId);

      const result = await fileService.deleteFile(id);

      return this.success(c, result, 'File deleted successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 健康检查
   * GET /files/health
   */
  async health(c: Context) {
    return this.success(
      c,
      {
        service: 'file-upload-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
      'File service is healthy',
    );
  }
}
