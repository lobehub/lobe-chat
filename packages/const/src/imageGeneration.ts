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
