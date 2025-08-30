import { ModelParamsSchema } from 'model-bank';

/**
 * 默认宽高比，当模型不支持原生宽高比时使用
 */
export const DEFAULT_ASPECT_RATIO = '1:1';

export const PRESET_ASPECT_RATIOS = [
  DEFAULT_ASPECT_RATIO, // '1:1' - 正方形，最常用
  '16:9', // 现代显示器/电视/视频标准
  '9:16', // 手机竖屏/短视频
  '4:3', // 传统显示器/照片
  '3:4', // 传统竖屏照片
  '3:2', // 经典照片比例横屏
  '2:3', // 经典照片比例竖屏
];

/**
 * Image generation and processing configuration constants
 */
export const IMAGE_GENERATION_CONFIG = {
  /**
   * Maximum cover image size in pixels (longest edge)
   * Used for generating cover images from source images
   */
  COVER_MAX_SIZE: 256,

  /**
   * Maximum thumbnail size in pixels (longest edge)
   * Used for generating thumbnail images from original images
   */
  THUMBNAIL_MAX_SIZE: 512,
} as const;

/**
 * Default dimension constraints for image upload auto-setting
 * Used when model schema doesn't provide min/max values
 */
export const DEFAULT_DIMENSION_CONSTRAINTS = {
  MAX_SIZE: 1024,
  MIN_SIZE: 512,
} as const;

export const MAX_SEED = 2 ** 31 - 1;

export const CHAT_MODEL_IMAGE_GENERATION_PARAMS: ModelParamsSchema = {
  imageUrl: {
    default: null,
  },
  prompt: { default: '' },
};
