import { AsyncTaskError, AsyncTaskStatus } from '../asyncTask';

export interface ImageGenerationTopic {
  id: string;
  title?: string | null;
  coverUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseGenerationAsset {
  type: string;
}

export interface ImageGenerationAsset extends BaseGenerationAsset {
  /**
   * api provider 家的 cdn url，一般很快就会失效
   */
  originalUrl?: string;
  /**
   * 存到自己 oss 的 url, 只存了 key， 完整的 url 需要使用 FileService.getFullFileUrl 获取
   */
  url?: string;
  /**
   * 缩略图，图片那就是尺寸裁剪过的，视频那就是封面的缩略图
   */
  thumbnailUrl?: string;
  /**
   * 图片/视频的宽度
   */
  width?: number;
  /**
   * 图片/视频的高度
   */
  height?: number;
}

export type GenerationAsset = ImageGenerationAsset;

export interface GenerationConfig {
  prompt: string;
  imageUrls?: string[];
  width?: number;
  height?: number;
  aspectRatio?: string;
  size?: string;
  steps?: number;
  cfg?: number;
}

export interface GenerationAsyncTask {
  id: string;
  status: AsyncTaskStatus;
  error?: AsyncTaskError;
}

export interface Generation {
  id: string;
  /**
   * The asset associated with the generation, containing image URLs and dimensions.
   */
  asset?: GenerationAsset | null;
  seed?: number | null;
  createdAt: Date;
  asyncTaskId: string | null;

  task: GenerationAsyncTask;
}

export interface GenerationBatch {
  id: string;
  provider: string;
  model: string;
  prompt: string;
  width?: number | null;
  height?: number | null;
  config?: GenerationConfig;
  createdAt: Date;
  generations: Generation[];
}
