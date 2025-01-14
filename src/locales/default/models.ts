import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

const locales: {
  [key: string]: {
    description?: string;
  };
} = {};

LOBE_DEFAULT_MODEL_LIST.forEach((model) => {
  if (!model.description) return;
  locales[model.id] = {
    description: model.description,
  };
});

export default locales;
