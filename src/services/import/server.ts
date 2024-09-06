import { DefaultErrorShape } from '@trpc/server/unstable-core-do-not-import';

import { edgeClient, lambdaClient } from '@/libs/trpc/client';
import { useUserStore } from '@/store/user';
import { ImportStage, ImporterEntryData, OnImportCallbacks } from '@/types/importer';
import { UserSettings } from '@/types/user/settings';
import { uuid } from '@/utils/uuid';

export class ServerService {
  importSettings = async (settings: UserSettings) => {
    await useUserStore.getState().importAppSettings(settings);
  };

  importData = async (data: ImporterEntryData, callbacks?: OnImportCallbacks): Promise<void> => {
    const handleError = (e: unknown) => {
      callbacks?.onStageChange?.(ImportStage.Error);
      const error = e as DefaultErrorShape;

      callbacks?.onError?.({
        code: error.data.code,
        httpStatus: error.data.httpStatus,
        message: error.message,
        path: error.data.path,
      });
    };

    const totalLength =
      (data.messages?.length || 0) +
      (data.sessionGroups?.length || 0) +
      (data.sessions?.length || 0) +
      (data.topics?.length || 0);

    if (totalLength < 500) {
      callbacks?.onStageChange?.(ImportStage.Importing);
      const time = Date.now();
      try {
        const result = await lambdaClient.importer.importByPost.mutate({ data });
        const duration = Date.now() - time;

        callbacks?.onStageChange?.(ImportStage.Success);
        callbacks?.onSuccess?.(result, duration);
      } catch (e) {
        handleError(e);
      }

      return;
    }

    // if the data is too large, upload it to S3 and upload by file
    const filename = `${uuid()}.json`;

    const pathname = `import_config/${filename}`;

    const url = await edgeClient.upload.createS3PreSignedUrl.mutate({ pathname });

    try {
      callbacks?.onStageChange?.(ImportStage.Uploading);
      await this.uploadWithProgress(url, data, callbacks?.onFileUploading);
    } catch {
      throw new Error('Upload Error');
    }

    callbacks?.onStageChange?.(ImportStage.Importing);
    const time = Date.now();
    try {
      const result = await lambdaClient.importer.importByFile.mutate({ pathname });
      const duration = Date.now() - time;
      callbacks?.onStageChange?.(ImportStage.Success);
      callbacks?.onSuccess?.(result, duration);
    } catch (e) {
      handleError(e);
    }
  };

  private uploadWithProgress = async (
    url: string,
    data: object,
    onProgress: OnImportCallbacks['onFileUploading'],
  ) => {
    const xhr = new XMLHttpRequest();

    let startTime = Date.now();
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Number(((event.loaded / event.total) * 100).toFixed(1));

        const speedInByte = event.loaded / ((Date.now() - startTime) / 1000);

        onProgress?.({
          // if the progress is 100, it means the file is uploaded
          // but the server is still processing it
          // so make it as 99.5 and let users think it's still uploading
          progress: progress === 100 ? 99.5 : progress,
          restTime: (event.total - event.loaded) / speedInByte,
          speed: speedInByte / 1024,
        });
      }
    });

    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', 'application/json');

    return new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(xhr.statusText);
        }
      });
      xhr.addEventListener('error', () => reject(xhr.statusText));
      xhr.send(JSON.stringify(data));
    });
  };
}
