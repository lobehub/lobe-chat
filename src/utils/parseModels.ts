import { produce } from 'immer';

import { LOBE_DEFAULT_MODEL_LIST, OpenAIProvider } from '@/config/modelProviders';
import { ChatModelCard } from '@/types/llm';
import { CustomModels } from '@/types/settings';

/**
 * Parse model string to add or remove models.
 */
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

/**
 * Extract a special method to process chatModels
 */
export const transformToChatModelCards = (
  modelString: string = '',
  defaultChartModels = OpenAIProvider.chatModels,
): ChatModelCard[] => {
  const modelConfig = parseModelString(modelString);
  let chatModels = modelConfig.removeAll ? [] : defaultChartModels;

  // 处理移除逻辑
  if (!modelConfig.removeAll) {
    chatModels = chatModels.filter((m) => !modelConfig.removed.includes(m.id));
  }

  return produce(chatModels, (draft) => {
    // 处理添加或替换逻辑
    for (const toAddModel of modelConfig.add) {
      // first try to find the model in LOBE_DEFAULT_MODEL_LIST to confirm if it is a known model
      const knownModel = LOBE_DEFAULT_MODEL_LIST.find((model) => model.id === toAddModel.id);

      // if the model is known, update it based on the known model
      if (knownModel) {
        const modelInList = draft.find((model) => model.id === toAddModel.id);

        // if the model is already in chatModels, update it
        if (modelInList) {
          // if (modelInList.hidden) delete modelInList.hidden;
          modelInList.enabled = true;
          if (toAddModel.displayName) modelInList.displayName = toAddModel.displayName;
        } else {
          // if the model is not in chatModels, add it
          draft.push({
            ...knownModel,
            displayName: toAddModel.displayName || knownModel.displayName || knownModel.id,
            enabled: true,
          });
        }
      } else {
        // if the model is not in LOBE_DEFAULT_MODEL_LIST, add it as a new custom model
        draft.push({
          ...toAddModel,
          displayName: toAddModel.displayName || toAddModel.id,
          enabled: true,
          functionCall: true,
          // isCustom: true,
          vision: true,
        });
      }
    }
  });
};
