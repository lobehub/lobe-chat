import type { BetterAuthProviderDefinition } from '../types';

const provider: BetterAuthProviderDefinition = {
  build: () => {
    console.warn(
      '[Better-Auth] feishu is not yet supported by Better-Auth generic OAuth, skipping...',
    );
    return undefined;
  },
  id: 'feishu',
  type: 'generic',
};

export default provider;
