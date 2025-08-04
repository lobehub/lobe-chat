/**
 * 移动端文件类型定义
 * 复制自 web 端，保持完全一致
 */

export enum FileSource {
  ImageGeneration = 'image_generation',
}

export interface FileItem {
  createdAt: Date;
  enabled?: boolean;
  id: string;
  name: string;
  size: number;
  source?: FileSource | null;
  type: string;
  updatedAt: Date;
  url: string;
}
