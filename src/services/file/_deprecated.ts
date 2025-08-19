import { FileModel } from '@/database/_deprecated/models/file';
import { clientS3Storage } from '@/services/file/ClientS3';
import { FileItem, UploadFileParams } from '@/types/files';

import { IFileService } from './type';

export class ClientService implements IFileService {
  async createFile(file: UploadFileParams) {
    // save to local storage
    // we may want to save to a remote server later
    const res = await FileModel.create({
      createdAt: Date.now(),
      data: undefined,
      fileHash: file.hash,
      fileType: file.fileType,
      metadata: file.metadata,
      name: file.name,
      saveMode: 'url',
      size: file.size,
      url: file.url,
    } as any);

    // get file to base64 url
    const base64 = await this.getBase64ByFileHash(file.hash!);

    return {
      id: res.id,
      url: `data:${file.fileType};base64,${base64}`,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async checkFileHash(_hash: string) {
    return { isExist: false, metadata: {}, url: '' };
  }

  async getFile(id: string): Promise<FileItem> {
    const item = await FileModel.findById(id);
    if (!item) {
      throw new Error('file not found');
    }

    // arrayBuffer to blob or base64 to blob
    const blob = !!item.data
      ? new Blob([item.data!], { type: item.fileType })
      : // @ts-ignore
        new Blob([Buffer.from(item.base64!, 'base64')], { type: item.fileType });

    const url = URL.createObjectURL(blob);

    return {
      createdAt: new Date(item.createdAt),
      id,
      name: item.name,
      size: item.size,
      type: item.fileType,
      updatedAt: new Date(item.updatedAt),
      url,
    };
  }

  async removeFile(id: string) {
    return FileModel.delete(id);
  }

  async removeFiles(ids: string[]) {
    await Promise.all(ids.map((id) => FileModel.delete(id)));
  }

  async removeAllFiles() {
    return FileModel.clear();
  }

  private async getBase64ByFileHash(hash: string) {
    const fileItem = await clientS3Storage.getObject(hash);
    if (!fileItem) throw new Error('file not found');

    return Buffer.from(await fileItem.arrayBuffer()).toString('base64');
  }
}
