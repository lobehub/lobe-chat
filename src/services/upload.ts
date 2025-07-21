import dayjs from 'dayjs';
import { sha256 } from 'js-sha256';

import { fileEnv } from '@/config/file';
import { isDesktop, isServerMode } from '@/const/version';
import { parseDataUri } from '@/libs/model-runtime/utils/uriParser';
import { edgeClient } from '@/libs/trpc/client';
import { API_ENDPOINTS } from '@/services/_url';
import { clientS3Storage } from '@/services/file/ClientS3';
import { FileMetadata, UploadBase64ToS3Result } from '@/types/files';
import { FileUploadState, FileUploadStatus } from '@/types/files/upload';
import { uuid } from '@/utils/uuid';

export const UPLOAD_NETWORK_ERROR = 'NetWorkError';

/**
 * Generate file storage path metadata for S3-compatible storage
 * @param originalFilename - Original filename
 * @param options - Path generation options
 * @returns Path metadata including date, dirname, filename, and pathname
 */
const generateFilePathMetadata = (
  originalFilename: string,
  options: { directory?: string; pathname?: string } = {},
): {
  date: string;
  dirname: string;
  filename: string;
  pathname: string;
} => {
  // Generate unique filename with UUID prefix and original extension
  const extension = originalFilename.split('.').at(-1);
  const filename = `${uuid()}.${extension}`;

  // Generate timestamp-based directory path
  const date = (Date.now() / 1000 / 60 / 60).toFixed(0);
  const dirname = `${options.directory || fileEnv.NEXT_PUBLIC_S3_FILE_PATH}/${date}`;
  const pathname = options.pathname ?? `${dirname}/${filename}`;

  return {
    date,
    dirname,
    filename,
    pathname,
  };
};

interface UploadFileToS3Options {
  directory?: string;
  filename?: string;
  onNotSupported?: () => void;
  onProgress?: (status: FileUploadStatus, state: FileUploadState) => void;
  pathname?: string;
  skipCheckFileType?: boolean;
}

class UploadService {
  /**
   * uniform upload method for both server and client
   */
  uploadFileToS3 = async (
    file: File,
    { onProgress, directory, skipCheckFileType, onNotSupported, pathname }: UploadFileToS3Options,
  ): Promise<{ data: FileMetadata; success: boolean }> => {
    const { getElectronStoreState } = await import('@/store/electron');
    const { electronSyncSelectors } = await import('@/store/electron/selectors');
    // only if not enable sync
    const state = getElectronStoreState();
    const isSyncActive = electronSyncSelectors.isSyncActive(state);

    // 桌面端上传逻辑（并且没开启 sync 同步）
    if (isDesktop && !isSyncActive) {
      const data = await this.uploadToDesktopS3(file, { directory, pathname });
      return { data, success: true };
    }

    // 服务端上传逻辑
    if (isServerMode) {
      // if is server mode, upload to server s3,

      const data = await this.uploadToServerS3(file, { directory, onProgress, pathname });
      return { data, success: true };
    }

    // upload to client s3
    // 客户端上传逻辑
    if (!skipCheckFileType && !file.type.startsWith('image')) {
      onNotSupported?.();
      return { data: undefined as unknown as FileMetadata, success: false };
    }

    const fileArrayBuffer = await file.arrayBuffer();

    // 1. check file hash
    const hash = sha256(fileArrayBuffer);
    // Upload to the indexeddb in the browser
    const data = await this.uploadToClientS3(hash, file);

    return { data, success: true };
  };

  uploadBase64ToS3 = async (
    base64Data: string,
    options: UploadFileToS3Options = {},
  ): Promise<UploadBase64ToS3Result> => {
    // 解析 base64 数据
    const { base64, mimeType, type } = parseDataUri(base64Data);

    if (!base64 || !mimeType || type !== 'base64') {
      throw new Error('Invalid base64 data for image');
    }

    // 将 base64 转换为 Blob
    const byteCharacters = atob(base64);
    const byteArrays = [];

    // 分块处理以避免内存问题
    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);

      const byteNumbers: number[] = Array.from({ length: slice.length });
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: mimeType });

    // 确定文件扩展名
    const fileExtension = mimeType.split('/')[1] || 'png';
    const fileName = `${options.filename || `image_${dayjs().format('YYYY-MM-DD-hh-mm-ss')}`}.${fileExtension}`;

    // 创建文件对象
    const file = new File([blob], fileName, { type: mimeType });

    // 使用统一的上传方法
    const { data: metadata } = await this.uploadFileToS3(file, options);
    const hash = sha256(await file.arrayBuffer());

    return {
      fileType: mimeType,
      hash,
      metadata,
      size: file.size,
    };
  };

  uploadDataToS3 = async (data: object, options: UploadFileToS3Options = {}) => {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const file = new File([blob], options.filename || 'data.json', { type: 'application/json' });
    return await this.uploadFileToS3(file, options);
  };

  uploadToServerS3 = async (
    file: File,
    {
      onProgress,
      directory,
      pathname,
    }: {
      directory?: string;
      onProgress?: (status: FileUploadStatus, state: FileUploadState) => void;
      pathname?: string;
    },
  ): Promise<FileMetadata> => {
    const xhr = new XMLHttpRequest();

    const { preSignUrl, ...result } = await this.getSignedUploadUrl(file, { directory, pathname });
    let startTime = Date.now();
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Number(((event.loaded / event.total) * 100).toFixed(1));

        const speedInByte = event.loaded / ((Date.now() - startTime) / 1000);

        onProgress?.('uploading', {
          // if the progress is 100, it means the file is uploaded
          // but the server is still processing it
          // so make it as 99.9 and let users think it's still uploading
          progress: progress === 100 ? 99.9 : progress,
          restTime: (event.total - event.loaded) / speedInByte,
          speed: speedInByte,
        });
      }
    });

    xhr.open('PUT', preSignUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    const data = await file.arrayBuffer();

    await new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.('success', {
            progress: 100,
            restTime: 0,
            speed: file.size / ((Date.now() - startTime) / 1000),
          });
          resolve(xhr.response);
        } else {
          reject(xhr.statusText);
        }
      });
      xhr.addEventListener('error', () => {
        if (xhr.status === 0) reject(UPLOAD_NETWORK_ERROR);
        else reject(xhr.statusText);
      });
      xhr.send(data);
    });

    return result;
  };

  private uploadToDesktopS3 = async (
    file: File,
    options: { directory?: string; pathname?: string } = {},
  ) => {
    const fileArrayBuffer = await file.arrayBuffer();
    const hash = sha256(fileArrayBuffer);

    // 生成文件路径元数据
    const { pathname } = generateFilePathMetadata(file.name, options);

    const { desktopFileAPI } = await import('@/services/electron/file');
    const { metadata } = await desktopFileAPI.uploadFile(file, hash, pathname);
    return metadata;
  };

  private uploadToClientS3 = async (hash: string, file: File): Promise<FileMetadata> => {
    await clientS3Storage.putObject(hash, file);

    return {
      date: (Date.now() / 1000 / 60 / 60).toFixed(0),
      dirname: '',
      filename: file.name,
      path: `client-s3://${hash}`,
    };
  };

  /**
   * get image File item with cors image URL
   * @param url
   * @param filename
   * @param fileType
   */
  getImageFileByUrlWithCORS = async (url: string, filename: string, fileType = 'image/png') => {
    const res = await fetch(API_ENDPOINTS.proxy, { body: url, method: 'POST' });
    const data = await res.arrayBuffer();

    return new File([data], filename, { lastModified: Date.now(), type: fileType });
  };

  private getSignedUploadUrl = async (
    file: File,
    options: { directory?: string; pathname?: string } = {},
  ): Promise<
    FileMetadata & {
      preSignUrl: string;
    }
  > => {
    // 生成文件路径元数据
    const { date, dirname, filename, pathname } = generateFilePathMetadata(file.name, options);

    const preSignUrl = await edgeClient.upload.createS3PreSignedUrl.mutate({ pathname });

    return {
      date,
      dirname,
      filename,
      path: pathname,
      preSignUrl,
    };
  };
}

export const uploadService = new UploadService();
