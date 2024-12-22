import { clientDB } from '@/database/client/db';
import { FileModel } from '@/database/server/models/file';
import { BaseClientService } from '@/services/baseClientService';
import { clientS3Storage } from '@/services/file/ClientS3';
import { FileItem, UploadFileParams } from '@/types/files';

import { IFileService } from './type';

export class ClientService extends BaseClientService implements IFileService {
  private get fileModel(): FileModel {
    return new FileModel(clientDB as any, this.userId);
  }

  async createFile(file: UploadFileParams) {
    // save to local storage
    // we may want to save to a remote server later
    const res = await this.fileModel.create(
      {
        fileHash: file.hash,
        fileType: file.fileType,
        knowledgeBaseId: file.knowledgeBaseId,
        metadata: file.metadata,
        name: file.name,
        size: file.size,
        url: file.url!,
      },
      true,
    );

    // get file to base64 url
    const base64 = await this.getBase64ByFileHash(file.hash!);

    return {
      id: res.id,
      url: `data:${file.fileType};base64,${base64}`,
    };
  }

  async getFile(id: string): Promise<FileItem> {
    const item = await this.fileModel.findById(id);
    if (!item) {
      throw new Error('file not found');
    }

    // arrayBuffer to url
    const fileItem = await clientS3Storage.getObject(item.fileHash!);
    if (!fileItem) throw new Error('file not found');

    const url = URL.createObjectURL(fileItem);

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
    await this.fileModel.delete(id, false);
  }

  async removeFiles(ids: string[]) {
    await this.fileModel.deleteMany(ids, false);
  }

  async removeAllFiles() {
    return this.fileModel.clear();
  }

  async checkFileHash(hash: string) {
    return this.fileModel.checkHash(hash);
  }

  private async getBase64ByFileHash(hash: string) {
    const fileItem = await clientS3Storage.getObject(hash);
    if (!fileItem) throw new Error('file not found');

    return Buffer.from(await fileItem.arrayBuffer()).toString('base64');
  }
}
