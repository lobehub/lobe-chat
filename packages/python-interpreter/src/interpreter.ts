import * as Comlink from 'comlink';

import type { PythonWorkerType } from './worker';

export const PythonInterpreter = (() => {
  if (typeof Worker !== 'undefined') {
    let workerURL = new URL('worker.ts', import.meta.url);
    if (typeof location !== 'undefined' && workerURL.origin !== location.origin) {
      workerURL = new URL(workerURL.pathname, location.origin);
    }
    const worker = new Worker(workerURL, {
      type: 'module',
    });
    return Comlink.wrap<PythonWorkerType>(worker);
  }
  return undefined;
})();
