import { AIProviderStoreState } from '@/store/aiInfra/initialState';
import { AiModelSourceEnum } from '@/types/aiModel';

// List
const enabledAiProviderModelList = (s: AIProviderStoreState) =>
  s.aiProviderModelList.filter((item) => item.enabled);

const disabledAiProviderModelList = (s: AIProviderStoreState) =>
  s.aiProviderModelList.filter((item) => !item.enabled);

const filteredAiProviderModelList = (s: AIProviderStoreState) => {
  const keyword = s.modelSearchKeyword.toLowerCase().trim();

  return s.aiProviderModelList.filter(
    (model) =>
      model.id.toLowerCase().includes(keyword) ||
      model.displayName?.toLowerCase().includes(keyword),
  );
};

const totalAiProviderModelList = (s: AIProviderStoreState) => s.aiProviderModelList.length;
const isEmptyAiProviderModelList = (s: AIProviderStoreState) => totalAiProviderModelList(s) === 0;

const hasRemoteModels = (s: AIProviderStoreState) =>
  s.aiProviderModelList.some((m) => m.source === AiModelSourceEnum.Remote);

const isModelEnabled = (id: string) => (s: AIProviderStoreState) =>
  enabledAiProviderModelList(s).some((i) => i.id === id);

const isModelLoading = (id: string) => (s: AIProviderStoreState) =>
  s.aiModelLoadingIds.includes(id);

const getAiModelById = (id: string) => (s: AIProviderStoreState) =>
  s.aiProviderModelList.find((i) => i.id === id);

const getEnabledModelById = (id: string) => (s: AIProviderStoreState) =>
  s.enabledAiModels?.find((i) => i.id === id);

const isModelSupportToolUse = (id: string) => (s: AIProviderStoreState) => {
  const model = getEnabledModelById(id)(s);

  return model?.abilities?.functionCall;
};

const isModelSupportVision = (id: string) => (s: AIProviderStoreState) => {
  const model = getEnabledModelById(id)(s);

  return model?.abilities?.vision;
};

export const aiModelSelectors = {
  disabledAiProviderModelList,
  enabledAiProviderModelList,
  filteredAiProviderModelList,
  getAiModelById,
  hasRemoteModels,
  isEmptyAiProviderModelList,
  isModelEnabled,
  isModelLoading,
  isModelSupportToolUse,
  isModelSupportVision,
  totalAiProviderModelList,
};
