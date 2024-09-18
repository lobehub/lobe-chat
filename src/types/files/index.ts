export enum FilesTabs {
  All = 'all',
  Audios = 'audios',
  Documents = 'documents',
  Images = 'images',
  Videos = 'videos',
  Websites = 'websites',
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
