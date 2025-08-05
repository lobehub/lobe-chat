import isEqual from 'fast-deep-equal';

import { useAiInfraStore } from '@/store/aiInfra';
import { EnabledProviderWithModels } from '@/types/aiModel';

/**
 * 获取可用的聊天模型列表
 * 注意：此hook只负责获取数据，数据的初始化由useAiInfraInit负责
 * 需要在使用此hook的组件中先调用useAiInfraInit来确保数据已加载
 */
export const useEnabledChatModels = (): EnabledProviderWithModels[] => {
  const enabledChatModelList = useAiInfraStore((s) => s.enabledChatModelList, isEqual);
  return enabledChatModelList || [];
};
