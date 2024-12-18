import { LOBE_DEFAULT_MODEL_LIST } from '@/config/modelProviders';

const locales: {
  [key: string]: {
    description?: string;
  };
} = {};

LOBE_DEFAULT_MODEL_LIST.flat().forEach((model) => {
  if (!model.description) return;
  locales[model.id] = {
    description: model.description,
  };
});

export default locales;
