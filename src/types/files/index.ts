export enum FilesTabs {
  All = 'all',
  Audios = 'audios',
  Documents = 'documents',
  Images = 'images',
  Videos = 'videos',
  Websites = 'websites',
}

/**
 * @deprecated
 */
export interface FilePreview {
  base64Url?: string;
  data?: ArrayBuffer;
  fileType: string;
  id: string;
  name: string;
  saveMode: 'local' | 'url';
  url: string;
}

export interface FileItem {
  createdAt: Date;
  enabled?: boolean;
  id: string;
  name: string;
  size: number;
  type: string;
  updatedAt: Date;
  url: string;
}

export * from './list';
export * from './upload';
