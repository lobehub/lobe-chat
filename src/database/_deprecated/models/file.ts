import { DBModel } from '@/database/_deprecated/core/types/db';
import { DB_File, DB_FileSchema } from '@/database/_deprecated/schemas/files';
import { clientS3Storage } from '@/services/file/ClientS3';
import { nanoid } from '@/utils/uuid';

import { BaseModel } from '../core';

class _FileModel extends BaseModel<'files'> {
  constructor() {
    super('files', DB_FileSchema);
  }

  async create(file: DB_File) {
    const id = nanoid();

    return this._addWithSync(file, `file-${id}`);
  }

  async findById(id: string): Promise<DBModel<DB_File> | undefined> {
    const item = await this.table.get(id);
    if (!item) return;

    // arrayBuffer to url
    let base64;
    if (!item.data) {
      const hash = (item.url as string).replace('client-s3://', '');
      base64 = await this.getBase64ByFileHash(hash);
    } else {
      base64 = Buffer.from(item.data).toString('base64');
    }

    return { ...item, base64, url: `data:${item.fileType};base64,${base64}` };
  }

  async delete(id: string) {
    return this.table.delete(id);
  }

  async clear() {
    return this.table.clear();
  }

  private async getBase64ByFileHash(hash: string) {
    const fileItem = await clientS3Storage.getObject(hash);
    if (!fileItem) throw new Error('file not found');

    return Buffer.from(await fileItem.arrayBuffer()).toString('base64');
  }
}

export const FileModel = new _FileModel();
