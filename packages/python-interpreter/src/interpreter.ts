import * as Comlink from 'comlink';

import type { PythonWorkerType } from './worker';

const worker = new Worker(new URL('worker.ts', import.meta.url), {
  type: 'module',
});

export const PythonInterpreter = Comlink.wrap<PythonWorkerType>(worker);
