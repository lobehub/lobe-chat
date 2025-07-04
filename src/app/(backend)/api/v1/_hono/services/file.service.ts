import { sha256 } from 'js-sha256';

import { DocumentModel } from '@/database/models/document';
import { FileModel } from '@/database/models/file';
import { FileItem } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { idGenerator } from '@/database/utils/idGenerator';
import { S3 } from '@/server/modules/S3';
import { DocumentService } from '@/server/services/document';
import { FileService as CoreFileService } from '@/server/services/file';
import { FileMetadata } from '@/types/files';
import { isChunkingUnsupported } from '@/utils/isChunkingUnsupported';
import { nanoid } from '@/utils/uuid';

import { BaseService } from '../common/base.service';
import {
  BatchFileUploadRequest,
  BatchFileUploadResponse,
  FileDeleteResponse,
  FileDetailResponse,
  FileListQuery,
  FileListResponse,
  FileParseRequest,
  FileParseResponse,
  FileUploadAndParseResponse,
  FileUploadRequest,
  FileUploadResponse,
  FileUrlRequest,
  FileUrlResponse,
  PermanentFileUrlResponse,
  PreSignedUrlRequest,
  PreSignedUrlResponse,
  PublicFileUploadRequest,
  PublicFileUploadResponse,
} from '../types/file.type';

/**
 * 文件上传服务类
 * 专门处理服务端模式的文件上传和管理功能
 */
export class FileUploadService extends BaseService {
  private fileModel: FileModel;
  private documentModel: DocumentModel;
  private coreFileService: CoreFileService;
  private documentService: DocumentService;
  private s3Service: S3;

  constructor(db: LobeChatDatabase, userId: string) {
    super(db, userId);
    this.fileModel = new FileModel(db, userId);
    this.documentModel = new DocumentModel(db, userId);
    this.coreFileService = new CoreFileService(db, userId!);
    this.documentService = new DocumentService(db, userId);
    this.s3Service = new S3();
  }

  async uploadToServerS3(
    file: File,
    {
      directory,
      pathname,
    }: {
      directory?: string;
      pathname?: string;
    },
  ): Promise<{ data: FileMetadata; success: boolean }> {
    const metadata = this.generateFileMetadata(file, directory);
    const key = pathname || metadata.path;

    // 直接使用S3服务上传文件，而不是预签名URL
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await this.s3Service.uploadBuffer(key, fileBuffer, file.type);

    const result: FileMetadata = {
      date: metadata.date,
      dirname: metadata.dirname,
      filename: metadata.filename,
      path: key,
    };

    return {
      data: result,
      success: true,
    };
  }

  /**
   * 单文件上传
   */
  async uploadFile(
    file: File,
    options: Partial<FileUploadRequest> = {},
  ): Promise<FileUploadResponse> {
    try {
      if (!this.userId) {
        throw this.createAuthError('User authentication required');
      }

      this.log('info', 'Starting file upload', {
        filename: file.name,
        size: file.size,
        type: file.type,
      });

      // 1. 验证文件
      await this.validateFile(file, options.skipCheckFileType);

      // 2. 计算文件哈希
      const fileArrayBuffer = await file.arrayBuffer();
      const hash = sha256(fileArrayBuffer);

      // 3. 使用现有的上传服务上传文件
      const uploadResult = await this.uploadToServerS3(file, {
        directory: options.directory,
        pathname: options.pathname,
      });

      if (!uploadResult.success) {
        throw this.createBusinessError('File upload failed');
      }

      const metadata = uploadResult.data;

      // 4. 保存文件记录到数据库
      const fileRecord = {
        chunkTaskId: null,
        clientId: null,
        embeddingTaskId: null,
        fileHash: hash,
        fileType: file.type,
        knowledgeBaseId: options.knowledgeBaseId,
        metadata: metadata,
        name: file.name,
        size: file.size,
        url: metadata.path,
      };

      const createResult = await this.fileModel.create(fileRecord, true);

      this.log('info', 'File uploaded successfully', {
        fileId: createResult.id,
        path: metadata.path,
        size: file.size,
      });

      // 获取完整的文件信息
      const savedFile = await this.fileModel.findById(createResult.id);
      if (!savedFile) {
        throw this.createBusinessError('Failed to retrieve uploaded file');
      }

      return this.convertToUploadResponse(savedFile);
    } catch (error) {
      this.log('error', 'File upload failed', error);
      throw error;
    }
  }

  /**
   * 批量文件上传
   */
  async uploadFiles(request: BatchFileUploadRequest): Promise<BatchFileUploadResponse> {
    const results: BatchFileUploadResponse = {
      failed: [],
      successful: [],
      summary: {
        failed: 0,
        successful: 0,
        total: request.files.length,
      },
    };

    for (const file of request.files) {
      try {
        const result = await this.uploadFile(file, {
          directory: request.directory,
          knowledgeBaseId: request.knowledgeBaseId,
          skipCheckFileType: request.skipCheckFileType,
        });
        results.successful.push(result);
        results.summary.successful++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.failed.push({
          error: errorMessage,
          filename: file.name,
        });
        results.summary.failed++;
        this.log('warn', 'File upload failed in batch', {
          error: errorMessage,
          filename: file.name,
        });
      }
    }

    return results;
  }

  /**
   * 创建预签名URL
   */
  async createPreSignedUrl(request: PreSignedUrlRequest): Promise<PreSignedUrlResponse> {
    try {
      if (!this.userId) {
        throw this.createAuthError('User authentication required');
      }

      const fileId = idGenerator('files');
      const metadata = this.generateFileMetadata(
        {
          name: request.filename,
          size: request.size,
          type: request.fileType,
        } as File,
        request.pathname ? undefined : 'uploads',
      );

      const key = request.pathname || metadata.path;

      // 创建预签名URL，有效期15分钟
      const uploadUrl = await this.coreFileService.createPreSignedUrl(key);

      this.log('info', 'Pre-signed URL created', { fileId, key });

      return {
        expiresIn: 900,
        fileId,
        key,
        uploadUrl, // 15分钟
      };
    } catch (error) {
      this.log('error', 'Create pre-signed URL failed', error);
      throw error;
    }
  }

  /**
   * 获取文件列表
   */
  async getFileList(query: FileListQuery): Promise<FileListResponse> {
    try {
      // 获取用户上传的全局文件
      const originalGlobalFiles = await this.db.query.globalFiles.findMany({
        where: (globalFile, { eq }) => eq(globalFile.creator, this.userId),
      });

      const globalFiles = originalGlobalFiles.map((file) => {
        return {
          ...file,
          filename: (file.metadata as FileMetadata)?.filename,
          hash: file.hashId || '',
          metadata: file.metadata as FileMetadata,
          uploadedAt: file.createdAt.toISOString(),
        } satisfies FileUploadResponse;
      });

      // 获取用户上传的会话文件
      const sessionFileRelations = await this.db.query.filesToSessions.findMany({
        where: (sessionFile, { eq }) => eq(sessionFile.userId, this.userId),
      });

      const sessionFileIds = sessionFileRelations?.map((sessionFile) => sessionFile.fileId);

      const originalSessionFiles = await this.db.query.files.findMany({
        where: (file, { inArray }) => inArray(file.id, sessionFileIds),
      });

      const sessionFiles = originalSessionFiles.map((file) => {
        return {
          ...file,
          filename: file.name,
          hash: file.fileHash || '',
          metadata: file.metadata as FileMetadata,
          uploadedAt: file.createdAt.toISOString(),
        } satisfies FileUploadResponse;
      });

      let responseFiles = [...globalFiles, ...sessionFiles].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      const total = responseFiles.length;

      if (query.page && query.pageSize) {
        const start = (query.page - 1) * query.pageSize;
        const end = start + query.pageSize;
        responseFiles = responseFiles.slice(start, end);
      }

      return {
        files: responseFiles,
        page: query.page,
        pageSize: query.pageSize,
        total,
      };
    } catch (error) {
      this.log('error', 'Get file list failed', error);
      throw error;
    }
  }

  /**
   * 获取文件详情
   */
  async getFileDetail(fileId: string): Promise<FileDetailResponse> {
    try {
      if (!this.userId) {
        throw this.createAuthError('User authentication required');
      }

      const file = await this.fileModel.findById(fileId);
      if (!file) {
        throw this.createCommonError('File not found');
      }

      // 检查权限
      if (file.userId !== this.userId) {
        throw this.createAuthorizationError('Access denied');
      }

      const baseResponse = this.convertToUploadResponse(file);

      return {
        ...baseResponse,
        parseStatus: 'pending',
        supportContentParsing: !isChunkingUnsupported(file.fileType),
      };
    } catch (error) {
      this.log('error', 'Get file detail failed', error);
      throw error;
    }
  }

  /**
   * 获取文件预签名访问URL
   */
  async getFileUrl(fileId: string, options: FileUrlRequest = {}): Promise<FileUrlResponse> {
    try {
      if (!this.userId) {
        throw this.createAuthError('User authentication required');
      }

      const file = await this.fileModel.findById(fileId);
      if (!file) {
        throw this.createCommonError('File not found');
      }

      // 检查权限
      if (file.userId !== this.userId) {
        throw this.createAuthorizationError('Access denied');
      }

      // 设置过期时间（默认1小时）
      const expiresIn = options.expiresIn || 3600;

      // 使用S3服务生成预签名URL
      const signedUrl = await this.s3Service.createPreSignedUrlForPreview(file.url, expiresIn);

      // 计算过期时间戳
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      this.log('info', 'File URL generated successfully', {
        expiresIn,
        fileId,
        filename: file.name,
      });

      return {
        expiresAt,
        expiresIn,
        fileId,
        filename: file.name,
        url: signedUrl,
      };
    } catch (error) {
      this.log('error', 'Get file URL failed', error);
      throw error;
    }
  }

  /**
   * 公共文件上传（设置为公共可读）
   */
  async uploadPublicFile(
    file: File,
    options: PublicFileUploadRequest = {},
  ): Promise<PublicFileUploadResponse> {
    try {
      if (!this.userId) {
        throw this.createAuthError('User authentication required');
      }

      this.log('info', 'Starting public file upload', {
        directory: options.directory,
        filename: file.name,
        size: file.size,
        type: file.type,
      });

      // 1. 验证文件
      await this.validateFile(file, options.skipCheckFileType);

      // 2. 计算文件哈希
      const fileArrayBuffer = await file.arrayBuffer();
      const hash = sha256(fileArrayBuffer);

      // 3. 生成文件元数据
      const metadata = this.generateFileMetadata(file, options.directory);

      // 4. 上传到S3（设置为公共可读）
      const fileBuffer = Buffer.from(fileArrayBuffer);
      await this.s3Service.uploadBuffer(metadata.path, fileBuffer, file.type);

      // 5. 生成公共访问URL
      const publicUrl = this.s3Service.getPublicUrl(metadata.path);

      // 6. 保存文件记录到数据库
      const fileRecord = {
        chunkTaskId: null,
        clientId: null,
        embeddingTaskId: null,
        fileHash: hash,
        fileType: file.type,
        knowledgeBaseId: options.knowledgeBaseId,
        metadata: metadata,
        name: file.name,
        size: file.size,
        url: metadata.path, // 存储S3键名
      };

      const createResult = await this.fileModel.create(fileRecord, true);

      this.log('info', 'Public file uploaded successfully', {
        fileId: createResult.id,
        path: metadata.path,
        publicUrl,
        size: file.size,
      });

      return {
        fileType: file.type,
        filename: file.name,
        hash,
        id: createResult.id,
        metadata,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: publicUrl, // 返回永久可访问的URL
      };
    } catch (error) {
      this.log('error', 'Public file upload failed', error);
      throw error;
    }
  }

  /**
   * 获取文件的永久访问URL
   */
  async getPermanentFileUrl(fileId: string): Promise<PermanentFileUrlResponse> {
    try {
      if (!this.userId) {
        throw this.createAuthError('User authentication required');
      }

      const file = await this.fileModel.findById(fileId);
      if (!file) {
        throw this.createCommonError('File not found');
      }

      // 检查权限
      if (file.userId !== this.userId) {
        throw this.createAuthorizationError('Access denied');
      }

      // 生成公共访问URL
      const publicUrl = this.s3Service.getPublicUrl(file.url);

      this.log('info', 'Permanent file URL generated successfully', {
        fileId,
        filename: file.name,
        publicUrl,
      });

      return {
        fileId,
        filename: file.name,
        url: publicUrl,
        urlType: 'public',
      };
    } catch (error) {
      this.log('error', 'Get permanent file URL failed', error);
      throw error;
    }
  }

  /**
   * 解析文件内容
   */
  async parseFile(
    fileId: string,
    options: Partial<FileParseRequest> = {},
  ): Promise<FileParseResponse> {
    try {
      if (!this.userId) {
        throw this.createAuthError('User authentication required');
      }

      // 1. 获取文件信息
      const file = await this.fileModel.findById(fileId);
      if (!file) {
        throw this.createCommonError('File not found');
      }

      // 2. 检查权限
      if (file.userId !== this.userId) {
        throw this.createAuthorizationError('Access denied');
      }

      // 3. 检查文件类型是否支持解析
      if (isChunkingUnsupported(file.fileType)) {
        throw this.createBusinessError(
          `File type '${file.fileType}' does not support content parsing`,
        );
      }

      // 4. 检查是否已经解析过（如果不跳过已存在的）
      if (!options.skipExist) {
        const existingDocument = await this.documentModel.findByFileId(fileId);
        if (existingDocument) {
          this.log('info', 'File already parsed, returning existing result', { fileId });

          return {
            content: existingDocument.content as string,
            fileId,
            fileType: file.fileType,
            filename: file.name,
            metadata: {
              pages: existingDocument.pages?.length || 0,
              title: existingDocument.title || undefined,
              totalCharCount: existingDocument.totalCharCount || undefined,
              totalLineCount: existingDocument.totalLineCount || undefined,
            },
            parseStatus: 'completed',
            parsedAt: existingDocument.createdAt.toISOString(),
          };
        }
      }

      this.log('info', 'Starting file parsing', {
        fileId,
        fileType: file.fileType,
        filename: file.name,
        skipExist: options.skipExist,
      });

      try {
        // 5. 使用 DocumentService 解析文件
        const document = await this.documentService.parseFile(fileId);

        this.log('info', 'File parsed successfully', {
          contentLength: document.content?.length || 0,
          fileId,
          pages: document.pages,
          totalCharCount: document.totalCharCount,
        });

        // 6. 返回解析结果
        return {
          content: document.content || '',
          fileId,
          fileType: file.fileType,
          filename: file.name,
          metadata: {
            pages: document.pages?.length || 0,
            title: document.title || undefined,
            totalCharCount: document.totalCharCount || undefined,
            totalLineCount: document.totalLineCount || undefined,
          },
          parseStatus: 'completed',
          parsedAt: new Date().toISOString(),
        };
      } catch (parseError) {
        const errorMessage =
          parseError instanceof Error ? parseError.message : 'Unknown parsing error';

        this.log('error', 'File parsing failed', {
          error: errorMessage,
          fileId,
          filename: file.name,
        });

        // 返回失败结果
        return {
          content: '',
          error: errorMessage,
          fileId,
          fileType: file.fileType,
          filename: file.name,
          parseStatus: 'failed',
          parsedAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      this.log('error', 'Parse file request failed', error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string): Promise<FileDeleteResponse> {
    try {
      if (!this.userId) {
        throw this.createAuthError('User authentication required');
      }

      const file = await this.fileModel.findById(fileId);
      if (!file) {
        throw this.createCommonError('File not found');
      }

      // 检查权限
      if (file.userId !== this.userId) {
        throw this.createAuthorizationError('Access denied');
      }

      // 删除S3文件
      await this.coreFileService.deleteFile(file.url);

      // 删除数据库记录
      await this.fileModel.delete(fileId);

      this.log('info', 'File deleted successfully', { fileId, key: file.url });

      return {
        deleted: true,
        fileId,
      };
    } catch (error) {
      this.log('error', 'Delete file failed', error);
      throw error;
    }
  }

  /**
   * 验证文件
   */
  private async validateFile(file: File, skipCheckFileType = false): Promise<void> {
    // 文件大小限制 (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      throw this.createBusinessError(
        `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`,
      );
    }

    // 文件名长度限制
    if (file.name.length > 255) {
      throw this.createBusinessError('Filename is too long (max 255 characters)');
    }

    // 检查文件类型（如果未跳过检查）
    if (!skipCheckFileType) {
      const allowedTypes = [
        'image/',
        'video/',
        'audio/',
        'text/',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ];

      const isAllowed = allowedTypes.some((type) => file.type.startsWith(type));
      if (!isAllowed) {
        throw this.createBusinessError(`File type '${file.type}' is not supported`);
      }
    }
  }

  /**
   * 生成文件元数据
   */
  private generateFileMetadata(file: File, directory?: string): FileMetadata {
    const now = new Date();
    const datePath = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const dir = directory || 'uploads';
    const filename = `${nanoid()}_${file.name}`;
    const path = `${dir}/${datePath}/${filename}`;

    return {
      date: now.toISOString(),
      dirname: dir,
      filename,
      path,
    };
  }

  /**
   * 转换为上传响应格式
   */
  private convertToUploadResponse(file: FileItem): FileUploadResponse {
    return {
      fileType: file.fileType,
      filename: file.name,
      hash: file.fileHash || '',
      id: file.id,
      metadata: file.metadata as FileMetadata,
      size: file.size,
      uploadedAt: file.createdAt.toISOString(),
      url: file.url,
    };
  }

  /**
   * 获取文件详情并解析文件内容
   */
  async getFileAndParse(
    fileId: string,
    options: Partial<FileParseRequest> = {},
  ): Promise<FileUploadAndParseResponse> {
    try {
      if (!this.userId) {
        throw this.createAuthError('User authentication required');
      }

      this.log('info', 'Starting file retrieval and parsing', {
        fileId,
        skipExist: options.skipExist,
      });

      // 1. 获取文件详情（上传结果）
      const uploadResult = await this.getFileDetail(fileId);

      // 2. 解析文件内容（解析结果）
      const parseResult = await this.parseFile(fileId, options);

      this.log('info', 'File retrieval and parsing completed successfully', {
        fileId,
        filename: uploadResult.filename,
        parseStatus: parseResult.parseStatus,
      });

      return {
        parseResult,
        uploadResult,
      };
    } catch (error) {
      this.log('error', 'File retrieval and parsing failed', error);
      throw error;
    }
  }

  /**
   * 上传文件并解析文件内容
   */
  async uploadAndParseFile(
    file: File,
    uploadOptions: Partial<FileUploadRequest> = {},
    parseOptions: Partial<FileParseRequest> = {},
  ): Promise<FileUploadAndParseResponse> {
    try {
      if (!this.userId) {
        throw this.createAuthError('User authentication required');
      }

      this.log('info', 'Starting file upload and parsing', {
        filename: file.name,
        size: file.size,
        skipExist: parseOptions.skipExist,
        type: file.type,
      });

      // 1. 上传文件
      const uploadResult = await this.uploadFile(file, uploadOptions);

      // 2. 解析文件内容
      const parseResult = await this.parseFile(uploadResult.id!, parseOptions);

      this.log('info', 'File upload and parsing completed successfully', {
        fileId: uploadResult.id,
        filename: uploadResult.filename,
        parseStatus: parseResult.parseStatus,
      });

      // 3. 构造详细的上传结果
      const detailResult = await this.getFileDetail(uploadResult.id!);

      return {
        parseResult,
        uploadResult: detailResult,
      };
    } catch (error) {
      this.log('error', 'File upload and parsing failed', error);
      throw error;
    }
  }
}
