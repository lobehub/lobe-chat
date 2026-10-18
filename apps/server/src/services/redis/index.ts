import { agentSignal } from './agentSignal';
import { deviceSystemInfo } from './deviceSystemInfo';
import { skillTools } from './skillTools';
import { steerQueue } from './steerQueue';
import { threadStartFence } from './threadStartFence';
import { workspaceRescan } from './workspaceRescan';

/** Business Redis API. Providers, keys and expiry policy stay inside each domain. */
export const redisService = {
  agentSignal,
  deviceSystemInfo,
  skillTools,
  steerQueue,
  threadStartFence,
  workspaceRescan,
};
