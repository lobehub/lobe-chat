import { sha256 } from 'js-sha256';

import { FileModel } from '@/database/models/file';
import { FileItem } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { idGenerator } from '@/database/utils/idGenerator';
import { S3 } from '@/server/modules/S3';
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
  FileUploadRequest,
  FileUploadResponse,
  PreSignedUrlRequest,
  PreSignedUrlResponse,
} from '../types/file.type';

/**
 * 文件上传服务类
 * 专门处理服务端模式的文件上传和管理功能
 */
export class FileUploadService extends BaseService {
  private fileModel: FileModel;
  private coreFileService: CoreFileService;
  private s3Service: S3;

  constructor(db: LobeChatDatabase, userId: string) {
    super(db, userId);
    this.fileModel = new FileModel(db, userId);
    this.coreFileService = new CoreFileService(db, userId!);
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
      if (!this.userId) {
        throw this.createAuthError('User authentication required');
      }

      // 暂时返回简单的响应，后续可以扩展
      const page = Math.max(1, query.page || 1);
      const pageSize = Math.min(100, Math.max(1, query.pageSize || 20));

      return {
        files: [],
        page,
        pageSize,
        total: 0,
        totalPages: 0,
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
}
