import { modelProviderService } from '@/services/modelProvider';
import { useGlobalStore } from '@/store/global';

export const getModelList = async (brand = 'openAI') => {
  const setSettings = useGlobalStore.getState().setSettings;
  const models = await modelProviderService.getOpenAIModelList();

  setSettings({ languageModel: { [brand]: { models } } });
};
