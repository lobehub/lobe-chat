import { CustomModels } from '@/types/settings';

export const parseModelString = (modelString: string = '') => {
  let models: CustomModels = [];
  let removeAll = false;
  const removedModels: string[] = [];
  const modelNames = modelString.split(/[,，]/).filter(Boolean);

  for (const item of modelNames) {
    const disable = item.startsWith('-');
    const nameConfig = item.startsWith('+') || item.startsWith('-') ? item.slice(1) : item;
    const [id, displayName] = nameConfig.split('=');

    if (disable) {
      // Disable all models.
      if (id === 'all') {
        removeAll = true;
      }
      removedModels.push(id);
      continue;
    }

    // Remove duplicate model entries.
    const existingIndex = models.findIndex(({ id: n }) => n === id);
    if (existingIndex !== -1) {
      models.splice(existingIndex, 1);
    }

    models.push({ displayName, id: id });
  }

  return {
    add: models,
    removeAll,
    removed: removedModels,
  };
};
