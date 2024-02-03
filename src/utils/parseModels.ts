import { CustomModels } from '@/types/settings';

export const parseModelString = (modelString: string = '') => {
  let models: CustomModels = [];

  const removedModels: string[] = [];
  const modelNames = modelString.split(/[,，]/).filter(Boolean);

  for (const item of modelNames) {
    const disable = item.startsWith('-');
    const nameConfig = item.startsWith('+') || item.startsWith('-') ? item.slice(1) : item;
    const [name, displayName] = nameConfig.split('=');

    if (disable) {
      // Disable all models.
      if (name === 'all') {
        models = [];
      }
      removedModels.push(name);
      continue;
    }

    // Remove duplicate model entries.
    const existingIndex = models.findIndex(({ id: n }) => n === name);
    if (existingIndex !== -1) {
      models.splice(existingIndex, 1);
    }

    models.push({
      displayName: displayName || name,
      id: name,
    });
  }

  return models.filter((m) => !removedModels.includes(m.id));
};
