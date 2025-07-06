import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { FileUploadService } from '../services/file.service';
import {
  BatchFileUploadRequest,
  FileListQuery,
  FileParseRequest,
  FileUploadRequest,
  FileUrlRequest,
  PublicFileUploadRequest,
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

      // 处理 multipart/form-data，支持中文文件名
      const formData = await c.req.parseBody();

      const file = formData['file'] as File;

      if (!file) {
        return this.error(c, 'No file provided', 400);
      }

      // 获取其他参数
      const knowledgeBaseId = formData['knowledgeBaseId'] as string | null;
      const skipCheckFileType = formData['skipCheckFileType'] === 'true';
      const directory = formData['directory'] as string | null;
      const sessionId = formData['sessionId'] as string | null;

      const options: Partial<FileUploadRequest> = {
        directory: directory || undefined,
        knowledgeBaseId: knowledgeBaseId || undefined,
        sessionId: sessionId || undefined,
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

      // 处理 multipart/form-data，支持中文文件名
      const formData = await c.req.formData();

      const files: File[] = [];

      // 收集所有文件
      const fileEntries = formData.getAll('files');

      for (const file of fileEntries) {
        if (file instanceof File) {
          files.push(file);
        } else {
          return this.error(c, 'Invalid file format', 400);
        }
      }

      if (files.length === 0) {
        return this.error(c, 'No files provided', 400);
      }

      // 获取其他参数
      const knowledgeBaseId = formData.get('knowledgeBaseId') as string | null;
      const skipCheckFileType = formData.get('skipCheckFileType') === 'true';
      const directory = formData.get('directory') as string | null;
      const sessionId = formData.get('sessionId') as string | null;

      const request: BatchFileUploadRequest = {
        directory: directory || undefined,
        files,
        knowledgeBaseId: knowledgeBaseId || undefined,
        sessionId: sessionId || undefined,
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
        page: query.page,
        pageSize: query.pageSize,
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
      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId);

      const result = await fileService.getFileDetail(id);

      return this.success(c, result, 'File details retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取文件访问URL
   * GET /files/:id/url
   */
  async getFileUrl(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在
      const { id } = this.getParams(c);
      const query = this.getQuery(c);

      // 解析查询参数
      const options: FileUrlRequest = {
        expiresIn: query.expiresIn ? parseInt(query.expiresIn as string, 10) : undefined,
      };

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId);

      const result = await fileService.getFileUrl(id, options);

      return this.success(c, result, 'File URL generated successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取文件永久访问URL
   * GET /files/:id/permanent-url
   */
  async getPermanentFileUrl(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在
      const { id } = this.getParams(c);
      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId);

      const result = await fileService.getPermanentFileUrl(id);

      return this.success(c, result, 'Permanent file URL generated successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 公共文件上传
   * POST /files/upload-public
   */
  async uploadPublicFile(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId);

      const formData = await this.getFormData(c);
      const file = formData.get('file') as File;

      if (!file) {
        return this.error(c, 'No file provided', 400);
      }

      // 获取其他参数
      const knowledgeBaseId = formData.get('knowledgeBaseId') as string | null;
      const skipCheckFileType = formData.get('skipCheckFileType') === 'true';
      const directory = formData.get('directory') as string | null;
      const sessionId = formData.get('sessionId') as string | null;

      const options: PublicFileUploadRequest = {
        directory: directory || undefined,
        knowledgeBaseId: knowledgeBaseId || undefined,
        sessionId: sessionId || undefined,
        skipCheckFileType,
      };

      const result = await fileService.uploadPublicFile(file, options);

      return this.success(c, result, 'Public file uploaded successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 解析文件内容
   * POST /files/:id/parse
   */
  async parseFile(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在
      const { id } = this.getParams(c);
      const query = this.getQuery(c);

      // 解析查询参数
      const options: Partial<FileParseRequest> = {
        skipExist: query.skipExist === 'true',
      };

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId);

      const result = await fileService.parseFile(id, options);

      return this.success(c, result, 'File parsed successfully');
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
      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId);

      const result = await fileService.deleteFile(id);

      return this.success(c, result, 'File deleted successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 上传文件并解析文件内容
   * POST /files/upload-and-parse
   */
  async uploadAndParseFile(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId);

      const formData = await this.getFormData(c);
      const file = formData.get('file') as File;

      if (!file) {
        return this.error(c, 'No file provided', 400);
      }

      // 获取其他参数
      const knowledgeBaseId = formData.get('knowledgeBaseId') as string | null;
      const skipCheckFileType = formData.get('skipCheckFileType') === 'true';
      const directory = formData.get('directory') as string | null;
      const sessionId = formData.get('sessionId') as string | null;
      const skipExist = formData.get('skipExist') === 'true';

      const uploadOptions: Partial<FileUploadRequest> = {
        directory: directory || undefined,
        knowledgeBaseId: knowledgeBaseId || undefined,
        sessionId: sessionId || undefined,
        skipCheckFileType,
      };

      const parseOptions = {
        skipExist,
      };

      const result = await fileService.uploadAndParseFile(file, uploadOptions, parseOptions);

      return this.success(c, result, 'File uploaded and parsed successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
