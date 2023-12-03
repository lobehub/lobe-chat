import { DB_File } from '../database/schemas/files';

export interface FilePreview extends Pick<DB_File, 'saveMode' | 'fileType'> {
  base64Url?: string;
  data?: ArrayBuffer;
  name: string;
  url: string;
}
