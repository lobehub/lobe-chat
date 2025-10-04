import { PGliteWorker } from '@electric-sql/pglite/worker';

import { InitMeta } from './type';

export const initPgliteWorker = async (meta: InitMeta) => {
  let workerURL = new URL('pglite.worker.ts', import.meta.url);
  if (typeof location !== 'undefined' && workerURL.origin !== location.origin) {
    workerURL = new URL(workerURL.pathname, location.origin);
  }
  const worker = await PGliteWorker.create(new Worker(workerURL), { meta });

  // 监听 worker 状态变化
  worker.onLeaderChange(() => {
    console.log('Worker leader changed, isLeader:', worker?.isLeader);
  });

  return worker as PGliteWorker;
};
