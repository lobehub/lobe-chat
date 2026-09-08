import type { HashWorkerRequest, HashWorkerResponse } from './hash.worker';
import { hashLocalFile } from './localFileHash';
import { hashFileStream, type HashProgress } from './stream';

const cancelledError = (signal: AbortSignal) =>
  signal.reason ?? new Error('Upload cancelled by user');

const hashFileInWorker = (file: File, signal?: AbortSignal, onProgress?: HashProgress) =>
  new Promise<string>((resolve, reject) => {
    if (signal?.aborted) return reject(cancelledError(signal));

    const worker = new Worker(new URL('hash.worker.ts', import.meta.url), { type: 'module' });
    const abort = () => {
      worker.terminate();
      reject(cancelledError(signal!));
    };
    const finish = (settle: () => void) => {
      signal?.removeEventListener('abort', abort);
      worker.terminate();
      settle();
    };

    signal?.addEventListener('abort', abort, { once: true });
    worker.addEventListener('message', (event: MessageEvent<HashWorkerResponse>) => {
      const data = event.data;
      if (data.type === 'progress') onProgress?.(data.progress);
      else if (data.type === 'done') finish(() => resolve(data.hash));
      else finish(() => reject(new Error(data.message)));
    });
    worker.addEventListener('error', (event) =>
      finish(() => reject(event.error ?? new Error(event.message))),
    );
    worker.postMessage({ file } satisfies HashWorkerRequest);
  });

export const hashFile = async (
  file: File,
  signal?: AbortSignal,
  onProgress?: HashProgress,
): Promise<string> => {
  const localHash = await hashLocalFile(file, signal);
  if (localHash) return localHash;

  if (typeof Worker === 'undefined') return hashFileStream(file, signal, onProgress);

  return hashFileInWorker(file, signal, onProgress);
};
