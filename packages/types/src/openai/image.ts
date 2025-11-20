import type { DallEImageQuality, DallEImageSize, DallEImageStyle } from '../tool/dalle';

export interface OpenAIImagePayload {
  model: 'dall-e-2' | 'dall-e-3';
  /**
   * The number of images to generate. Must be between 1 and 10.
   */
  n?: number;
  /**
   * A text description of the desired image(s).
   * The maximum length is 1000 characters.
   */
  prompt: string;
  /**
   * The quality of the image that will be generated.
   * hd creates images with finer details and greater consistency across the image.
   * This param is only supported for dall-e-3.
   */
  quality?: DallEImageQuality;
  /**
   * The size of the generated images.
   * Must be one of '1792x1024' , '1024x1024' , '1024x1792'
   */
  size?: DallEImageSize;

  /**
   * The style of the generated images. Must be one of vivid or natural.
   * Vivid causes the model to lean towards generating hyper-real and dramatic images.
   * Natural causes the model to produce more natural, less hyper-real looking images.
   * This param is only supported for dall-e-3.
   * @default vivid
   */
  style?: DallEImageStyle;
}
