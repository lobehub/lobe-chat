export enum FilesTabs {
  All = 'all',
  Audios = 'audios',
  Documents = 'documents',
  Images = 'images',
  Videos = 'videos',
  Websites = 'websites',
}

export enum TRPCErrorMessage {
  // files not find in origin 
  OrginFileNotFound = 'Origin File Not Found',
  FileContentEmpty ='File content is empty',
  FileNotFound = 'File not found'
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
