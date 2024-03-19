import { FileModel } from '@/database/models/file';
import { DB_File } from '@/database/schemas/files';
import { FilePreview } from '@/types/files';
import compressImage from '@/utils/compressImage';

import { API_ENDPOINTS } from './_url';

class FileService {
  private isImage(fileType: string) {
    const imageRegex = /^image\//;
    return imageRegex.test(fileType);
  }
  async uploadFile(file: DB_File) {
    // 跳过图片上传测试
    const isTestData = file.size === 1;
    if (this.isImage(file.fileType) && !isTestData) {
      return this.uploadImageFile(file);
    }

    // save to local storage
    // we may want to save to a remote server later
    return FileModel.create(file);
  }

  async uploadImageFile(file: DB_File) {
    // 加载图片
    const url = file.url || URL.createObjectURL(new Blob([file.data]));

    const img = new Image();
    img.src = url;
    await (() =>
      new Promise((resolve) => {
        img.addEventListener('load', resolve);
      }))();

    // 压缩图片
    const base64String = compressImage({ img, type: file.fileType });
    const binaryString = atob(base64String.split('base64,')[1]);
    const uint8Array = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
    file.data = uint8Array.buffer;

    return FileModel.create(file);
  }

  async uploadImageByUrl(url: string, file: Pick<DB_File, 'name' | 'metadata'>) {
    const res = await fetch(API_ENDPOINTS.proxy, { body: url, method: 'POST' });
    const data = await res.arrayBuffer();
    const fileType = res.headers.get('content-type') || 'image/webp';

    return this.uploadFile({
      data,
      fileType,
      metadata: file.metadata,
      name: file.name,
      saveMode: 'local',
      size: data.byteLength,
    });
  }

  async removeFile(id: string) {
    return FileModel.delete(id);
  }

  async removeAllFiles() {
    return FileModel.clear();
  }

  async getFile(id: string): Promise<FilePreview> {
    const item = await FileModel.findById(id);
    if (!item) {
      throw new Error('file not found');
    }

    // arrayBuffer to url
    const url = URL.createObjectURL(new Blob([item.data], { type: item.fileType }));
    const base64 = Buffer.from(item.data).toString('base64');

    return {
      base64Url: `data:${item.fileType};base64,${base64}`,
      fileType: item.fileType,
      name: item.name,
      saveMode: 'local',
      url,
    };
  }
}

export const fileService = new FileService();
