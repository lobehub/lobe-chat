import { LocalFile } from '@/types/database/files';

export const lobeDBSchema = {
  files: '&id, name, fileType, saveMode',
};

export interface LobeDBSchemaMap {
  files: LocalFile;
}
