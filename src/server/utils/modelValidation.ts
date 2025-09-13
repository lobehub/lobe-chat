import { ModelProvider } from '@lobechat/model-runtime';
import { ProviderConfig } from '@lobechat/types';
import { AiFullModelCard } from 'model-bank';

import { getServerGlobalConfig } from '../globalConfig';

/**
 * 检查指定的模型是否在服务器端被禁用
 * Check if the specified model is disabled on the server side
 */
export const isModelDisabled = async (modelId: string, provider: string): Promise<boolean> => {
  const serverConfig = await getServerGlobalConfig();
  const providerConfig = serverConfig.aiProvider[provider as ModelProvider] as ProviderConfig;
  
  if (!providerConfig) return false;

  const { serverModelLists } = providerConfig;
  
  // 如果没有配置 serverModelLists，说明没有限制，模型可用
  // If serverModelLists is not configured, there are no restrictions and the model is available
  if (!serverModelLists || serverModelLists.length === 0) {
    return false;
  }

  // 检查模型是否在服务器模型列表中
  // Check if the model is in the server model list
  const modelExists = serverModelLists.some((model: AiFullModelCard) => model.id === modelId);
  
  // 如果模型不在服务器配置的列表中，说明被禁用了
  // If the model is not in the server configured list, it means it's disabled
  return !modelExists;
};

/**
 * 验证请求中的模型是否被允许使用
 * Validate if the model in the request is allowed to be used
 */
export const validateModelAccess = async (modelId: string, provider: string): Promise<void> => {
  const disabled = await isModelDisabled(modelId, provider);
  
  if (disabled) {
    throw new Error(`Model "${modelId}" is disabled for provider "${provider}" by server configuration`);
  }
};

/**
 * 获取指定 provider 的启用模型列表
 * Get the enabled model list for the specified provider
 */
export const getEnabledModels = async (provider: string): Promise<string[]> => {
  const serverConfig = await getServerGlobalConfig();
  const providerConfig = serverConfig.aiProvider[provider as ModelProvider] as ProviderConfig;
  
  if (!providerConfig?.serverModelLists) {
    return []; // 如果没有配置，返回空数组表示没有限制
  }

  return providerConfig.serverModelLists.map((model: AiFullModelCard) => model.id);
};

/**
 * 过滤模型列表，移除被禁用的模型
 * Filter model list, remove disabled models
 */
export const filterEnabledModels = async (
  models: any[], 
  provider: string,
  modelIdField: string = 'id'
): Promise<any[]> => {
  const enabledModelIds = await getEnabledModels(provider);
  
  // 如果没有服务器配置，返回所有模型
  // If there's no server configuration, return all models
  if (enabledModelIds.length === 0) {
    return models;
  }

  // 只返回在启用列表中的模型
  // Only return models that are in the enabled list
  return models.filter(model => enabledModelIds.includes(model[modelIdField]));
};