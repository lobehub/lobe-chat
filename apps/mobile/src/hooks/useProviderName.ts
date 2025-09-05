import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';

export const useProviderName = (provider?: string) => {
  if (!provider) return '';

  const providerCard = DEFAULT_MODEL_PROVIDER_LIST.find((p) => p.id === provider);

  return providerCard?.name || provider;
};
