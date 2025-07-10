import { DefaultErrorShape } from '@trpc/server/unstable-core-do-not-import';

import { lambdaClient } from '@/libs/trpc/client';
import { uploadService } from '@/services/upload';
import { useUserStore } from '@/store/user';
import { ImportPgDataStructure } from '@/types/export';
import { ImportStage, OnImportCallbacks } from '@/types/importer';
import { uuid } from '@/utils/uuid';

import { IImportService } from './type';

export class ServerService implements IImportService {
  importSettings: IImportService['importSettings'] = async (settings) => {
    await useUserStore.getState().importAppSettings(settings);
  };

  importData: IImportService['importData'] = async (data, callbacks) => {
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
        callbacks?.onSuccess?.(result.results, duration);
      } catch (e) {
        handleError(e);
      }

      return;
    }

    await this.uploadData(data, { callbacks, handleError });
  };

  importPgData: IImportService['importPgData'] = async (
    data: ImportPgDataStructure,
    {
      callbacks,
    }: {
      callbacks?: OnImportCallbacks;
      overwriteExisting?: boolean;
    } = {},
  ): Promise<void> => {
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

    const totalLength = Object.values(data.data)
      .map((d) => d.length)
      .reduce((a, b) => a + b, 0);

    if (totalLength < 500) {
      callbacks?.onStageChange?.(ImportStage.Importing);
      const time = Date.now();
      try {
        const result = await lambdaClient.importer.importPgByPost.mutate(data);
        const duration = Date.now() - time;

        callbacks?.onStageChange?.(ImportStage.Success);
        callbacks?.onSuccess?.(result.results, duration);
      } catch (e) {
        handleError(e);
      }

      return;
    }

    await this.uploadData(data, { callbacks, handleError });
  };

  private uploadData = async (
    data: object,
    { callbacks, handleError }: { callbacks?: OnImportCallbacks; handleError: (e: unknown) => any },
  ) => {
    // if the data is too large, upload it to S3 and upload by file
    const filename = `${uuid()}.json`;

    let pathname;
    try {
      callbacks?.onStageChange?.(ImportStage.Uploading);
      const result = await uploadService.uploadDataToS3(data, {
        filename,
        onProgress: (status, state) => {
          callbacks?.onFileUploading?.(state);
        },
        pathname: `import_config/${filename}`,
      });
      pathname = result.data.path;
      console.log(pathname);
    } catch {
      throw new Error('Upload Error');
    }

    callbacks?.onStageChange?.(ImportStage.Importing);
    const time = Date.now();
    try {
      const result = await lambdaClient.importer.importByFile.mutate({ pathname });
      const duration = Date.now() - time;
      callbacks?.onStageChange?.(ImportStage.Success);
      callbacks?.onSuccess?.(result.results, duration);
    } catch (e) {
      handleError(e);
    }
  };
}
