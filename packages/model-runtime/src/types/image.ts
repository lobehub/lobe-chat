/* eslint-disable typescript-sort-keys/interface */
import { RuntimeImageGenParams } from 'model-bank';

import { ModelUsage } from '@/types/message';

export type CreateImagePayload = {
  model: string;
  params: RuntimeImageGenParams;
};

/**
 * Why return width and height?
 * 1. The configured width may differ from the actual generated width, which needs to be stored in the generation asset
 * 2. Image dimensions are needed to determine if thumbnail generation is required. Most providers return dimensions, potentially saving computation
 */
export type CreateImageResponse = {
  /**
   * Usually the provider's CDN URL, which often expires after some time and needs to be re-requested
   */
  imageUrl: string;

  /**
   * Image width
   */
  width?: number;

  /**
   * Image height
   */
  height?: number;

  /**
   * For models like GPT-image, Nano Banana which are LLMs with image output modality
   */
  modelUsage?: ModelUsage;
};
