import type { GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition = {
  // @ts-expect-error - feishu is not yet supported by Better-Auth generic OAuth
  build: () => {
    console.warn(
      '[Better-Auth] feishu is not yet supported by Better-Auth generic OAuth, skipping...',
    );
    return undefined;
  },
  checkEnvs: () => {
    return false;
  },
  id: 'feishu',
  type: 'generic',
};

export default provider;
