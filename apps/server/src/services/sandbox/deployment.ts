import { sandboxEnv } from '@/envs/sandbox';

import { getSandboxProviderKind } from './factory';

export type SandboxDeployment = 'market' | 'onlyboxes' | 'unconfigured';

/** The sandbox this deployment runs commands in; `unconfigured` when its provider lacks settings. */
export const getSandboxDeployment = (): SandboxDeployment => {
  if (getSandboxProviderKind() !== 'onlyboxes') return 'market';
  return sandboxEnv.ONLYBOXES_BASE_URL && sandboxEnv.ONLYBOXES_JIT_SIGNING_KEY
    ? 'onlyboxes'
    : 'unconfigured';
};
