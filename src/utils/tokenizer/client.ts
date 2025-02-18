let worker: Worker | null = null;

const getWorker = () => {
  if (!worker && typeof Worker !== 'undefined') {
    worker = new Worker(new URL('tokenizer.worker.ts', import.meta.url));
  }
  return worker;
};

export const clientEncodeAsync = (str: string): Promise<number> =>
  new Promise((resolve, reject) => {
    const worker = getWorker();

    if (!worker) {
      // 如果 WebWorker 不可用，回退到字符串计算
      resolve(str.length);
      return;
    }

    const id = str;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.id === id) {
        worker.removeEventListener('message', handleMessage);
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }
      }
    };

    worker.addEventListener('message', handleMessage);
    worker.postMessage({ id, str });
  });
