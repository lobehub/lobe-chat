import type { GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition = {
  // @ts-expect-error - wechat is not yet supported by Better-Auth generic OAuth
  build: () => {
    console.warn(
      '[Better-Auth] wechat is not yet supported by Better-Auth generic OAuth, skipping...',
    );
    return undefined;
  },

  checkEnvs: () => {
    return false;
  },
  id: 'wechat',
  type: 'generic',
};

export default provider;
