import { PLUGIN_SCHEMA_API_MD5_PREFIX, PLUGIN_SCHEMA_SEPARATOR } from '@lobechat/const';
import { Md5 } from 'ts-md5';

// OpenAI GPT function_call name can't be longer than 64 characters
// So we need to use md5 to shorten the name
export const genToolCallShortMD5Hash = (name: string) => Md5.hashStr(name).toString().slice(0, 16);

export const genToolCallingName = (identifier: string, name: string, type: string = 'default') => {
  const pluginType = type && type !== 'default' ? `${PLUGIN_SCHEMA_SEPARATOR + type}` : '';

  // 将插件的 identifier 作为前缀，避免重复
  let apiName = identifier + PLUGIN_SCHEMA_SEPARATOR + name + pluginType;

  // OpenAI GPT function_call name can't be longer than 64 characters
  // So we need to use md5 to shorten the name
  // and then find the correct apiName in response by md5
  if (apiName.length >= 64) {
    const md5Content = PLUGIN_SCHEMA_API_MD5_PREFIX + genToolCallShortMD5Hash(name);

    apiName = identifier + PLUGIN_SCHEMA_SEPARATOR + md5Content + pluginType;
  }

  return apiName;
};

/**
 * Resolve MD5 hashed API name back to original name using manifest
 * @param apiName - The potentially hashed API name
 * @param manifest - The plugin manifest containing original API names
 * @returns The original API name if hash is found, otherwise returns the input apiName
 */
export const resolveHashedApiName = (
  apiName: string,
  manifest?: { api?: Array<{ name: string }> },
): string => {
  // If apiName doesn't start with MD5 prefix, it's not hashed
  if (!apiName.startsWith(PLUGIN_SCHEMA_API_MD5_PREFIX)) {
    return apiName;
  }

  // If no manifest provided, can't resolve
  if (!manifest?.api) {
    return apiName;
  }

  // Extract MD5 hash from the hashed apiName
  const md5Hash = apiName.replace(PLUGIN_SCHEMA_API_MD5_PREFIX, '');

  // Find the original API name by matching MD5 hash
  const originalApi = manifest.api.find((api) => genToolCallShortMD5Hash(api.name) === md5Hash);

  return originalApi ? originalApi.name : apiName;
};
