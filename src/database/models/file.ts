import { LocalFile, LocalFileSchema } from '@/types/database/files';
import { nanoid } from '@/utils/uuid';

import { BaseModel } from '../core';

class _FileModel extends BaseModel<'files'> {
  constructor() {
    super('files', LocalFileSchema);
  }

  async create(file: LocalFile) {
    const id = nanoid();

    return this.add(file, `file-${id}`);
  }

  async findById(id: string) {
    return this.table.get(id);
  }

  async delete(id: string) {
    return this.table.delete(id);
  }
}

export const FileModel = new _FileModel();
