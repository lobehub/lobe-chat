import { agentIdentity } from './agentIdentity';
import { agentSignal } from './agentSignal';
import { deviceSystemInfo } from './deviceSystemInfo';
import { linear } from './linear';
import { skillTools } from './skillTools';
import { steerQueue } from './steerQueue';
import { threadStartFence } from './threadStartFence';
import { workspaceRescan } from './workspaceRescan';

/** Business Redis API. Providers, keys and expiry policy stay inside each domain. */
export const redisService = {
  agentIdentity,
  agentSignal,
  deviceSystemInfo,
  linear,
  skillTools,
  steerQueue,
  threadStartFence,
  workspaceRescan,
};
