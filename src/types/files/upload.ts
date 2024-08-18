import { z } from 'zod';

import { FileParsingTask } from '@/types/asyncTask';

export interface FileUploadState {
  progress: number;
  /**
   * rest time in s
   */
  restTime: number;
  /**
   * upload speed in KB/s
   */
  speed: number;
}

export type FileUploadStatus = 'pending' | 'uploading' | 'processing' | 'success' | 'error';

export type FileProcessStatus = 'pending' | 'chunking' | 'embedding' | 'success' | 'error';

export const UPLOAD_STATUS_SET = new Set(['uploading', 'pending', 'processing']);

// the file that is upload at chat page
export interface UploadFileItem {
  /**
   * base64 url of image url
   */
  base64Url?: string;
  file: File;
  fileUrl?: string;
  id: string;
  /**
   * blob url for local preview
   */
  previewUrl?: string;
  status: FileUploadStatus;
  tasks?: FileParsingTask;
  uploadState?: FileUploadState;
}

export const FileMetadataSchema = z.object({
  date: z.string(),
  dirname: z.string(),
  filename: z.string(),
  path: z.string(),
});

export type FileMetadata = z.infer<typeof FileMetadataSchema>;

export const UploadFileSchema = z.object({
  data: z.instanceof(ArrayBuffer).optional(),
  /**
   * file type
   * @example 'image/png'
   */
  fileType: z.string(),
  // TODO: Need be required
  hash: z.string().optional(),

  knowledgeBaseId: z.string().optional(),

  metadata: z.any().optional(),

  /**
   * file name
   * @example 'test.png'
   */
  name: z.string(),

  /**
   * the mode database save the file
   * local mean save the raw file into data
   * url mean upload the file to a cdn and then save the url
   */
  saveMode: z.enum(['local', 'url']),
  /**
   * file size
   */
  size: z.number(),
  /**
   * file url if saveMode is url
   */
  url: z.string().optional(),
});

export type UploadFileParams = z.infer<typeof UploadFileSchema>;
