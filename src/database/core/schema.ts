import { LocalFile } from '@/types/database/files';

export const lobeDBSchema = {
  files: '&id, name, type',
};

export interface LobeDBSchemaMap {
  files: LocalFile;
}
