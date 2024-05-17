import { DB_File } from '@/database/client/schemas/files';
import { API_ENDPOINTS } from '@/services/_url';
import compressImage from '@/utils/compressImage';

class UploadService {
  async uploadFile(file: DB_File) {
    // 跳过图片上传测试
    const isTestData = file.size === 1;
    if (this.isImage(file.fileType) && !isTestData) {
      return this.uploadImageFile(file);
    }

    // save to local storage
    // we may want to save to a remote server later
    return file;
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

  private isImage(fileType: string) {
    const imageRegex = /^image\//;
    return imageRegex.test(fileType);
  }

  private async uploadImageFile(file: DB_File) {
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

    return file;
  }
}

export const uploadService = new UploadService();
