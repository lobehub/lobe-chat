import { LocalFile } from './database/files';

export interface FilePreview extends Pick<LocalFile, 'saveMode' | 'fileType'> {
  base64Url?: string;
  data?: ArrayBuffer;
  name: string;
  url: string;
}
