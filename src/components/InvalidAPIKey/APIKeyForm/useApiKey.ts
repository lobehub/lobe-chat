import isEqual from 'fast-deep-equal';
import { useContext } from 'react';

import { isDeprecatedEdition } from '@/const/version';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useUserStore } from '@/store/user';
import { keyVaultsConfigSelectors } from '@/store/user/selectors';

import { LoadingContext } from './LoadingContext';

export const useApiKey = (provider: string) => {
  const [apiKey, baseURL, setConfig] = useUserStore((s) => [
    keyVaultsConfigSelectors.getVaultByProvider(provider as any)(s)?.apiKey,
    keyVaultsConfigSelectors.getVaultByProvider(provider as any)(s)?.baseURL,
    s.updateKeyVaultConfig,
  ]);
  const { setLoading } = useContext(LoadingContext);
  const updateAiProviderConfig = useAiInfraStore((s) => s.updateAiProviderConfig);
  const data = useAiInfraStore(aiProviderSelectors.providerConfigById(provider), isEqual);

  // TODO: remove this in V2
  if (isDeprecatedEdition) return { apiKey, baseURL, setConfig };
  //

  return {
    apiKey: data?.keyVaults.apiKey,
    baseURL: data?.keyVaults?.baseURL,
    setConfig: async (id: string, params: Record<string, string>) => {
      const next = { ...data?.keyVaults, ...params };
      if (isEqual(data?.keyVaults, next)) return;

      setLoading(true);
      await updateAiProviderConfig(id, {
        keyVaults: { ...data?.keyVaults, ...params },
      });
      setLoading(false);
    },
  };
};
