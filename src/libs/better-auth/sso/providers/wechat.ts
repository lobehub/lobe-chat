import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () => {
    console.warn(
      '[Better-Auth] wechat is not yet supported by Better-Auth generic OAuth, skipping...',
    );
    return undefined;
  },
  id: 'wechat',
  type: 'generic',
};

export default provider;
