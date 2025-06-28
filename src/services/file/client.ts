import { clientDB } from '@/database/client/db';
import { FileModel } from '@/database/models/file';
import { BaseClientService } from '@/services/baseClientService';
import { clientS3Storage } from '@/services/file/ClientS3';

import { IFileService } from './type';

export class ClientService extends BaseClientService implements IFileService {
  private get fileModel(): FileModel {
    return new FileModel(clientDB as any, this.userId);
  }

  createFile: IFileService['createFile'] = async (file) => {
    // 使用安全哈希检查，考虑访问权限隔离
    const { isExist } = await this.fileModel.checkSecureHash(file.hash!, file.url!, file.metadata);

    // save to local storage
    // we may want to save to a remote server later
    const res = await this.fileModel.create(
      {
        fileHash: file.hash, // 这将在 create 方法中被安全哈希替换
        fileType: file.fileType,
        knowledgeBaseId: file.knowledgeBaseId,
        metadata: file.metadata,
        name: file.name,
        originalHash: file.hash, // 传递原始哈希
        size: file.size,
        url: file.url!,
      },
      !isExist,
    );

    // get file to base64 url - 使用安全哈希
    const secureHash = this.fileModel.generateSecureHash(file.hash!, file.url!, file.metadata);
    const base64 = await this.getBase64ByFileHash(secureHash);

    return {
      id: res.id,
      url: `data:${file.fileType};base64,${base64}`,
    };
  };

  getFile: IFileService['getFile'] = async (id) => {
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
  };

  removeFile: IFileService['removeFile'] = async (id) => {
    await this.fileModel.delete(id, false);
  };

  removeFiles: IFileService['removeFiles'] = async (ids) => {
    await this.fileModel.deleteMany(ids, false);
  };

  removeAllFiles: IFileService['removeAllFiles'] = async () => {
    return this.fileModel.clear();
  };

  checkFileHash: IFileService['checkFileHash'] = async (hash) => {
    return this.fileModel.checkHash(hash);
  };

  private getBase64ByFileHash = async (hash: string) => {
    const fileItem = await clientS3Storage.getObject(hash);
    if (!fileItem) throw new Error('file not found');

    return Buffer.from(await fileItem.arrayBuffer()).toString('base64');
  };
}
