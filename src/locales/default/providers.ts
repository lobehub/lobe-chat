import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';

const locales: {
  [key: string]: {
    description?: string;
  };
} = {};

DEFAULT_MODEL_PROVIDER_LIST.forEach((provider) => {
  if (!provider.description) return;
  locales[provider.id] = {
    description: provider.description,
  };
});

export default locales;
