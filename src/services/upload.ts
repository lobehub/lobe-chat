import { fileEnv } from '@/config/file';
import { FileModel } from '@/database/client/models/file';
import { edgeClient } from '@/libs/trpc/client';
import { FileMetadata, UploadFileParams } from '@/types/files';
import { FileUploadState, FileUploadStatus } from '@/types/files/upload';
import { uuid } from '@/utils/uuid';

export const UPLOAD_NETWORK_ERROR = 'NetWorkError';

class UploadService {
  uploadWithProgress = async (
    file: File,
    onProgress: (status: FileUploadStatus, state: FileUploadState) => void,
  ): Promise<FileMetadata> => {
    const xhr = new XMLHttpRequest();

    const { preSignUrl, ...result } = await this.getSignedUploadUrl(file);
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
          speed: speedInByte / 1024,
        });
      }
    });

    xhr.open('PUT', preSignUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    const data = await file.arrayBuffer();

    await new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress('success', {
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

  uploadToClientDB = async (params: UploadFileParams, file: File) => {
    const fileArrayBuffer = await file.arrayBuffer();

    // save to local storage
    // we may want to save to a remote server later
    const res = await FileModel.create({
      createdAt: Date.now(),
      ...params,
      data: fileArrayBuffer,
    });
    // arrayBuffer to url
    const base64 = Buffer.from(fileArrayBuffer).toString('base64');

    return {
      id: res.id,
      url: `data:${params.fileType};base64,${base64}`,
    };
  };

  private getSignedUploadUrl = async (
    file: File,
  ): Promise<
    FileMetadata & {
      preSignUrl: string;
    }
  > => {
    const filename = `${uuid()}.${file.name.split('.').at(-1)}`;

    // 精确到以 h 为单位的 path
    const date = (Date.now() / 1000 / 60 / 60).toFixed(0);
    const dirname = `${fileEnv.NEXT_PUBLIC_S3_FILE_PATH}/${date}`;
    const pathname = `${dirname}/${filename}`;

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
