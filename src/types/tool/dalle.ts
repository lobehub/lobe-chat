export type DallEImageQuality = 'standard' | 'hd';
export type DallEImageStyle = 'vivid' | 'natural';
export type DallEImageSize = '1792x1024' | '1024x1024' | '1024x1792';

export interface DallEImageItem {
  imageId?: string;
  previewUrl?: string;
  prompt: string;
  quality: DallEImageQuality;
  size: DallEImageSize;
  style: DallEImageStyle;
}
