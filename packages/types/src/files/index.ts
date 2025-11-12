export enum FilesTabs {
  All = 'all',
  Audios = 'audios',
  Documents = 'documents',
  Home = 'home',
  Images = 'images',
  Pages = 'pages',
  Videos = 'videos',
  Websites = 'websites',
}

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

export * from './list';
export * from './upload';
