import { z } from 'zod';

import { FileMetadata } from '@/types/files';

/**
 * 文件上传请求类型
 */
export interface FileUploadRequest {
  /** 文件目录（可选） */
  directory?: string;
  /** 文件对象 */
  file: File;
  /** 知识库ID（可选） */
  knowledgeBaseId?: string;
  /** 自定义路径（可选） */
  pathname?: string;
  /** 是否跳过文件类型检查 */
  skipCheckFileType?: boolean;
}

/**
 * 文件上传响应类型
 */
export interface FileUploadResponse {
  /** 文件MIME类型 */
  fileType: string;
  /** 文件名 */
  filename: string;
  /** 文件哈希值 */
  hash: string;
  /** 文件ID */
  id: string;
  /** 文件元数据 */
  metadata: FileMetadata;
  /** 文件大小（字节） */
  size: number;
  /** 上传时间 */
  uploadedAt: string;
  /** 文件访问URL */
  url: string;
}

/**
 * 预签名URL请求类型
 */
export interface PreSignedUrlRequest {
  /** 文件MIME类型 */
  fileType: string;
  /** 文件名 */
  filename: string;
  /** 自定义路径（可选） */
  pathname?: string;
  /** 文件大小（字节） */
  size: number;
}

/**
 * 预签名URL响应类型
 */
export interface PreSignedUrlResponse {
  /** 过期时间 */
  expiresIn: number;
  /** 文件ID */
  fileId: string;
  /** S3对象键 */
  key: string;
  /** 上传URL */
  uploadUrl: string;
}

/**
 * 文件列表查询参数
 */
export interface FileListQuery {
  /** 文件类型过滤 */
  fileType?: string;
  /** 知识库ID过滤 */
  knowledgeBaseId?: string;
  /** 页码（从1开始） */
  page?: number;
  /** 每页数量 */
  pageSize?: number;
  /** 搜索关键词 */
  search?: string;
}

/**
 * 文件列表响应类型
 */
export interface FileListResponse {
  /** 文件列表 */
  files: FileUploadResponse[];
  /** 当前页 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 总数 */
  total: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 文件详情响应类型
 */
export interface FileDetailResponse extends FileUploadResponse {
  /** 解析错误信息 */
  parseError?: string;
  /** 解析状态 */
  parseStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  /** 是否支持内容解析 */
  supportContentParsing: boolean;
}

/**
 * 文件删除响应类型
 */
export interface FileDeleteResponse {
  /** 是否删除成功 */
  deleted: boolean;
  /** 删除的文件ID */
  fileId: string;
}

/**
 * 批量文件上传请求类型
 */
export interface BatchFileUploadRequest {
  /** 上传目录（可选） */
  directory?: string;
  /** 文件列表 */
  files: File[];
  /** 知识库ID（可选） */
  knowledgeBaseId?: string;
  /** 是否跳过文件类型检查 */
  skipCheckFileType?: boolean;
}

/**
 * 批量文件上传响应类型
 */
export interface BatchFileUploadResponse {
  /** 失败的文件及错误信息 */
  failed: Array<{
    error: string;
    filename: string;
  }>;
  /** 成功上传的文件 */
  successful: FileUploadResponse[];
  /** 总计数量 */
  summary: {
    failed: number;
    successful: number;
    total: number;
  };
}

/**
 * 文件上传进度回调类型
 */
export interface FileUploadProgress {
  /** 文件名 */
  filename: string;
  /** 已上传字节数 */
  loaded: number;
  /** 上传百分比 */
  percentage: number;
  /** 上传状态 */
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  /** 总字节数 */
  total: number;
}

// Zod Schemas for validation
export const PreSignedUrlRequestSchema = z.object({
  fileType: z.string().min(1, '文件类型不能为空'),
  filename: z.string().min(1, '文件名不能为空'),
  pathname: z.string().optional(),
  size: z.number().positive('文件大小必须大于0'),
});

export const FileListQuerySchema = z.object({
  fileType: z.string().optional(),
  knowledgeBaseId: z.string().optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
});

export const FileIdParamSchema = z.object({
  id: z.string().min(1, '文件 ID 不能为空'),
});
