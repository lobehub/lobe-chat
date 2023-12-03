import { consola } from 'consola';

import syncAgentIndex from './syncAgentIndex';
import syncPluginIndex from './syncPluginIndex';

const runSync = async () => {
  consola.start('Start sync readme workflow...');
  await syncAgentIndex();
  await syncPluginIndex();
};

runSync();
