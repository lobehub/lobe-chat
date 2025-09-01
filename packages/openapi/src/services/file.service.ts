import { FileMetadata } from '@lobechat/types';
import { and, count, desc, eq, ilike } from 'drizzle-orm';
import { sha256 } from 'js-sha256';

import { DocumentModel } from '@/database/models/document';
import { FileModel } from '@/database/models/file';
import { FileItem, files, filesToSessions } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { S3 } from '@/server/modules/S3';
import { DocumentService } from '@/server/services/document';
import { FileService as CoreFileService } from '@/server/services/file';
import { isChunkingUnsupported } from '@/utils/isChunkingUnsupported';
import { nanoid } from '@/utils/uuid';

import { BaseService } from '../common/base.service';
import {
  BatchFileUploadRequest,
  BatchFileUploadResponse,
  BatchGetFilesRequest,
  BatchGetFilesResponse,
  FileDeleteResponse,
  FileListQuery,
  FileListResponse,
  FileParseRequest,
  FileParseResponse,
  FileUploadAndParseResponse,
  FileUploadRequest,
  FileUploadResponse,
  FileUrlRequest,
  FileUrlResponse,
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

  /**
   * 确保获取完整URL，避免重复拼接
   * 检查URL是否已经是完整URL，如果不是则生成完整URL
   */
  private async ensureFullUrl(url?: string): Promise<string> {
    if (!url) {
      return '';
    }

    // 检查URL是否已经是完整URL（向后兼容历史数据）
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      return url; // 已经是完整URL，直接返回
    } else {
      // 相对路径，生成完整URL
      return await this.coreFileService.getFullFileUrl(url);
    }
  }

  /**
   * 转换为上传响应格式
   */
  private async convertToUploadResponse(file: FileItem): Promise<FileUploadResponse> {
    const fullUrl = await this.ensureFullUrl(file.url);

    return {
      fileType: file.fileType,
      hash: file.fileHash || '',
      id: file.id,
      metadata: file.metadata as FileMetadata,
      name: file.name,
      size: file.size,
      uploadedAt: file.createdAt.toISOString(),
      url: fullUrl || file.url,
    };
  }

  /**
   * 批量文件上传
   */
  async uploadFiles(request: BatchFileUploadRequest): Promise<BatchFileUploadResponse> {
    try {
      const isPermitted = await this.resolveOperationPermission('FILE_UPLOAD');
      if (!isPermitted.isPermitted) {
        throw this.createAuthorizationError(isPermitted.message || '无权上传文件');
      }

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
            sessionId: request.sessionId,
            skipCheckFileType: request.skipCheckFileType,
          });
          results.successful.push(result);
          results.summary.successful++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.failed.push({
            error: errorMessage,
            name: file.name,
          });
          results.summary.failed++;
          this.log('warn', 'File upload failed in batch', {
            error: errorMessage,
            name: file.name,
          });
        }
      }

      return results;
    } catch (error) {
      this.handleServiceError(error, '批量上传文件');
    }
  }

  /**
   * 获取文件列表，支持两种场景：
   * 1. 获取系统中所有用户文件
   * 2. 获取指定用户文件
   */
  async getFileList({ userId, ...query }: FileListQuery): Promise<FileListResponse> {
    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission(
        'FILE_READ',
        userId
          ? {
              targetUserId: userId,
            }
          : undefined,
      );

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问文件列表');
      }

      this.log('info', 'Getting file list', {
        fileType: query.fileType,
        knowledgeBaseId: query.knowledgeBaseId,
        page: query.page,
        pageSize: query.pageSize,
        search: query.search,
      });

      // 计算分页参数
      const page = query.page || 1;
      const pageSize = Math.min(query.pageSize || 20, 100); // 限制最大每页数量为100
      const offset = (page - 1) * pageSize;

      // 构建查询条件
      const whereConditions = [];

      // 添加模糊查询条件
      if (query.search) {
        whereConditions.push(ilike(files.name, `%${query.search}%`));
      }

      // 添加文件类型过滤
      if (query.fileType) {
        whereConditions.push(ilike(files.fileType, `${query.fileType}%`));
      }

      // 添加权限相关的查询条件
      if (permissionResult?.condition?.userId) {
        whereConditions.push(eq(files.userId, permissionResult.condition.userId));
      }

      const whereClause = and(...whereConditions);

      // 执行分页查询
      const filesResult = await this.db
        .select({
          accessedAt: files.accessedAt,
          chunkTaskId: files.chunkTaskId,
          clientId: files.clientId,
          createdAt: files.createdAt,
          embeddingTaskId: files.embeddingTaskId,
          fileHash: files.fileHash,
          fileType: files.fileType,
          id: files.id,
          metadata: files.metadata,
          name: files.name,
          size: files.size,
          source: files.source,
          updatedAt: files.updatedAt,
          url: files.url,
          userId: files.userId,
        })
        .from(files)
        .where(whereClause)
        .orderBy(desc(files.createdAt))
        .limit(pageSize)
        .offset(offset);

      // 查询总数
      const totalResult = await this.db.select({ count: count() }).from(files).where(whereClause);

      const totalCount = totalResult[0]?.count || 0;

      // 转换为响应格式
      const responseFiles = await Promise.all(
        filesResult.map((file) => this.convertToUploadResponse(file)),
      );

      this.log('info', 'File list retrieved successfully', {
        count: filesResult.length,
        page,
        pageSize,
        total: totalCount,
      });

      return {
        files: responseFiles,
        page,
        pageSize,
        total: totalCount,
      };
    } catch (error) {
      this.handleServiceError(error, '获取文件列表');
    }
  }

  /**
   * 获取文件详情
   */
  async getFileDetail(fileId: string): Promise<FileUploadResponse> {
    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('FILE_READ', {
        targetFileId: fileId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问此文件');
      }

      // 构建查询条件
      const whereConditions = [eq(files.id, fileId)];
      if (permissionResult.condition?.userId) {
        whereConditions.push(eq(files.userId, permissionResult.condition.userId));
      }

      const file = await this.db.query.files.findFirst({
        where: and(...whereConditions),
      });

      if (!file) {
        throw this.createCommonError('File not found');
      }

      return this.convertToUploadResponse(file);
    } catch (error) {
      this.handleServiceError(error, '获取文件详情');
    }
  }

  /**
   * 获取文件预签名访问URL
   */
  async getFileUrl(fileId: string, options: FileUrlRequest = {}): Promise<FileUrlResponse> {
    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('FILE_READ', {
        targetFileId: fileId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问此文件');
      }

      const file = await this.fileModel.findById(fileId);
      if (!file) {
        throw this.createCommonError('File not found');
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
        name: file.name,
      });

      return {
        expiresAt,
        expiresIn,
        fileId,
        name: file.name,
        url: signedUrl,
      };
    } catch (error) {
      this.handleServiceError(error, '获取文件URL');
    }
  }

  /**
   * 文件上传
   */
  async uploadFile(
    file: File,
    options: PublicFileUploadRequest = {},
  ): Promise<PublicFileUploadResponse> {
    try {
      const isPermitted = await this.resolveOperationPermission('FILE_UPLOAD');

      if (!isPermitted.isPermitted) {
        throw this.createAuthorizationError(isPermitted.message || '无权上传文件');
      }

      this.log('info', 'Starting public file upload', {
        directory: options.directory,
        name: file.name,
        size: file.size,
        type: file.type,
      });

      // 1. 验证文件
      await this.validateFile(file, options.skipCheckFileType);

      // 2. 计算文件哈希
      const fileArrayBuffer = await file.arrayBuffer();
      const hash = sha256(fileArrayBuffer);

      // 3. 检查文件是否已存在（去重逻辑）
      if (!options.skipDeduplication) {
        const existingFileCheck = await this.fileModel.checkHash(hash);

        if (existingFileCheck.isExist) {
          this.log('info', 'Public file already exists, checking user file record', {
            existingUrl: existingFileCheck.url,
            hash,
            name: file.name,
          });

          // 检查当前用户是否已经有这个文件的记录
          const existingUserFile = await this.findExistingUserFile(hash);

          if (existingUserFile) {
            // 用户已有此文件记录，直接返回
            this.log('info', 'User already has this public file record', {
              fileId: existingUserFile.id,
              name: existingUserFile.name,
            });

            // 如果提供了 sessionId，创建文件和会话的关联关系
            if (options.sessionId) {
              await this.createFileSessionRelation(existingUserFile.id, options.sessionId);
              this.log('info', 'Existing public file associated with session', {
                fileId: existingUserFile.id,
                sessionId: options.sessionId,
              });
            }

            // 生成返回的完整URL
            const publicUrl = await this.ensureFullUrl(existingUserFile.url);

            return {
              fileType: existingUserFile.fileType,
              hash,
              id: existingUserFile.id,
              metadata: existingUserFile.metadata as FileMetadata,
              name: existingUserFile.name,
              size: existingUserFile.size,
              uploadedAt: existingUserFile.createdAt.toISOString(),
              url: publicUrl,
            };
          } else {
            // 文件在全局表中存在，但用户没有记录，创建用户文件记录
            this.log('info', 'Public file exists globally, creating user file record', {
              hash,
              name: file.name,
            });

            const fileRecord = {
              chunkTaskId: null,
              clientId: null,
              embeddingTaskId: null,
              fileHash: hash,
              fileType: file.type,
              knowledgeBaseId: options.knowledgeBaseId,
              metadata: existingFileCheck.metadata as FileMetadata,
              name: file.name,
              size: file.size,
              url: existingFileCheck.url || '',
            };

            const createResult = await this.fileModel.create(fileRecord, false); // 不插入全局表，因为已存在

            // 如果提供了 sessionId，创建文件和会话的关联关系
            if (options.sessionId) {
              await this.createFileSessionRelation(createResult.id, options.sessionId);
              this.log('info', 'Deduplicated public file associated with session', {
                fileId: createResult.id,
                sessionId: options.sessionId,
              });
            }

            this.log('info', 'Deduplicated public file created successfully', {
              fileId: createResult.id,
              path: existingFileCheck.url,
              sessionId: options.sessionId,
              size: file.size,
              url: existingFileCheck.url,
            });

            const publicUrl = await this.ensureFullUrl(existingFileCheck.url);

            return {
              fileType: file.type,
              hash,
              id: createResult.id,
              metadata: existingFileCheck.metadata as FileMetadata,
              name: file.name,
              size: file.size,
              uploadedAt: new Date().toISOString(),
              url: publicUrl,
            };
          }
        }
      }

      // 4. 文件不存在，正常上传流程
      const metadata = this.generateFileMetadata(file, options.directory);

      // 5. 上传到 S3
      const fileBuffer = Buffer.from(fileArrayBuffer);
      await this.s3Service.uploadBuffer(metadata.path, fileBuffer, file.type);

      // 7. 保存文件记录到数据库
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

      // 如果提供了 sessionId，创建文件和会话的关联关系
      if (options.sessionId) {
        await this.createFileSessionRelation(createResult.id, options.sessionId);
        this.log('info', 'Public file associated with session', {
          fileId: createResult.id,
          sessionId: options.sessionId,
        });
      }

      // 7. 生成返回的完整URL
      const publicUrl = await this.ensureFullUrl(metadata.path);

      this.log('info', 'Public file uploaded successfully', {
        fileId: createResult.id,
        path: metadata.path,
        publicUrl,
        sessionId: options.sessionId,
        size: file.size,
      });

      return {
        fileType: file.type,
        hash,
        id: createResult.id,
        metadata,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: publicUrl,
      };
    } catch (error) {
      this.handleServiceError(error, '上传文件');
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
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('FILE_READ', {
        targetFileId: fileId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权解析此文件');
      }

      // 1. 获取文件信息
      const file = await this.fileModel.findById(fileId);
      if (!file) {
        throw this.createCommonError('File not found');
      }

      // 2. 检查文件类型是否支持解析
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
            metadata: {
              pages: existingDocument.pages?.length || 0,
              title: existingDocument.title || undefined,
              totalCharCount: existingDocument.totalCharCount || undefined,
              totalLineCount: existingDocument.totalLineCount || undefined,
            },
            name: file.name,
            parseStatus: 'completed',
            parsedAt: existingDocument.createdAt.toISOString(),
          };
        }
      }

      this.log('info', 'Starting file parsing', {
        fileId,
        fileType: file.fileType,
        name: file.name,
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
          metadata: {
            pages: document.pages?.length || 0,
            title: document.title || undefined,
            totalCharCount: document.totalCharCount || undefined,
            totalLineCount: document.totalLineCount || undefined,
          },
          name: file.name,
          parseStatus: 'completed',
          parsedAt: new Date().toISOString(),
        };
      } catch (parseError) {
        const errorMessage =
          parseError instanceof Error ? parseError.message : 'Unknown parsing error';

        this.log('error', 'File parsing failed', {
          error: errorMessage,
          fileId,
          name: file.name,
        });

        // 返回失败结果
        return {
          content: '',
          error: errorMessage,
          fileId,
          fileType: file.fileType,
          name: file.name,
          parseStatus: 'failed',
          parsedAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      this.handleServiceError(error, '解析文件');
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string): Promise<FileDeleteResponse> {
    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('FILE_DELETE', {
        targetFileId: fileId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权删除此文件');
      }

      const file = await this.fileModel.findById(fileId);
      if (!file) {
        throw this.createCommonError('File not found');
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
      this.handleServiceError(error, '删除文件');
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
        'application/x-yaml',
        'application/yaml',
        'application/json',
      ];

      // 基于文件扩展名的额外验证（用于处理 application/octet-stream 等通用类型）
      const allowedExtensions = [
        '.yaml',
        '.yml',
        '.json',
        '.txt',
        '.md',
        '.xml',
        '.csv',
        '.tsv',
        '.pdf',
        '.doc',
        '.docx',
        '.xls',
        '.xlsx',
        '.ppt',
        '.pptx',
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.bmp',
        '.webp',
        '.svg',
        '.mp4',
        '.avi',
        '.mov',
        '.wmv',
        '.flv',
        '.webm',
        '.mp3',
        '.wav',
        '.ogg',
        '.aac',
        '.flac',
        '.m4a',
      ];

      const isAllowed = allowedTypes.some((type) => file.type.startsWith(type));
      const fileExtension = file.name.toLowerCase().slice(Math.max(0, file.name.lastIndexOf('.')));
      const isExtensionAllowed = allowedExtensions.includes(fileExtension);

      // 如果文件类型不被允许，但扩展名是允许的（处理 application/octet-stream 等情况）
      if (!isAllowed && !isExtensionAllowed) {
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
   * 获取文件详情并解析文件内容
   */
  async getFileAndParse(
    fileId: string,
    options: Partial<FileParseRequest> = {},
  ): Promise<FileUploadAndParseResponse> {
    try {
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
        name: uploadResult.name,
        parseStatus: parseResult.parseStatus,
      });

      return {
        fileItem: uploadResult,
        parseResult,
      };
    } catch (error) {
      this.handleServiceError(error, '获取文件并解析');
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
      this.log('info', 'Starting file upload and parsing', {
        name: file.name,
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
        name: uploadResult.name,
        parseStatus: parseResult.parseStatus,
      });

      // 3. 构造详细的上传结果
      const detailResult = await this.getFileDetail(uploadResult.id!);

      return {
        fileItem: detailResult,
        parseResult,
      };
    } catch (error) {
      this.handleServiceError(error, '上传并解析文件');
    }
  }

  /**
   * 创建文件和会话的关联关系
   */
  private async createFileSessionRelation(fileId: string, sessionId: string): Promise<void> {
    try {
      await this.db
        .insert(filesToSessions)
        .values({
          fileId,
          sessionId,
          userId: this.userId,
        })
        .onConflictDoNothing();

      this.log('info', 'File-session relation created', {
        fileId,
        sessionId,
        userId: this.userId,
      });
    } catch (error) {
      this.handleServiceError(error, '创建文件和会话的关联关系');
    }
  }

  /**
   * 批量获取文件详情和内容
   */
  async batchGetFiles(request: BatchGetFilesRequest): Promise<BatchGetFilesResponse> {
    try {
      this.log('info', 'Starting batch file retrieval', {
        count: request.fileIds.length,
        fileIds: request.fileIds,
      });

      const files: BatchGetFilesResponse['files'] = [];
      const failed: BatchGetFilesResponse['failed'] = [];

      // 并行处理所有文件
      const promises = request.fileIds.map(async (fileId) => {
        try {
          // 获取文件详情
          const fileDetail = await this.getFileDetail(fileId);

          // 检查是否为图片文件
          const isImage = fileDetail.fileType.startsWith('image/');

          if (!isImage) {
            // 非图片文件：获取解析结果
            try {
              const parseResult = await this.parseFile(fileId, { skipExist: true });

              files.push({
                fileItem: fileDetail,
                parseResult,
              });
            } catch (parseError) {
              // 如果解析失败，仍然返回文件详情，但不包含解析结果
              this.log('warn', 'Failed to parse file content', {
                error: parseError,
                fileId,
              });

              files.push({
                fileItem: fileDetail,
              });
            }
          } else {
            files.push({
              fileItem: fileDetail,
            });
          }
        } catch (error) {
          this.log('error', 'Failed to get file detail', {
            error,
            fileId,
          });

          failed.push({
            error: error instanceof Error ? error.message : 'Unknown error',
            fileId,
          });
        }
      });

      // 等待所有异步操作完成
      await Promise.all(promises);

      const result: BatchGetFilesResponse = {
        failed,
        files,
        success: files.length,
        total: request.fileIds.length,
      };

      this.log('info', 'Batch file retrieval completed', {
        failed: result.failed.length,
        success: result.success,
        total: result.total,
      });

      return result;
    } catch (error) {
      this.handleServiceError(error, '批量获取文件详情和内容');
    }
  }

  /**
   * 查找用户是否已有指定哈希的文件记录
   */
  private async findExistingUserFile(hash: string): Promise<FileItem | null> {
    try {
      const existingFile = await this.db.query.files.findFirst({
        where: and(eq(files.fileHash, hash), eq(files.userId, this.userId)),
      });

      return existingFile || null;
    } catch (error) {
      this.handleServiceError(error, '查找用户是否已有指定哈希的文件记录');
    }
  }
}
