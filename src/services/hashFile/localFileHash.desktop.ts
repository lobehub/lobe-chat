import { localFileService } from '@/services/electron/localFileService';
import { getElectronLocalFilePath } from '@/utils/electron/localFilePath';

export const hashLocalFile = async (
  file: File,
  signal?: AbortSignal,
): Promise<string | undefined> => {
  const path = getElectronLocalFilePath(file);
  if (!path) return undefined;

  const hash = await localFileService.hashLocalFile({ path });
  if (signal?.aborted) throw signal.reason ?? new Error('Upload cancelled by user');
  return hash;
};
