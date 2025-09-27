import { LobeChatPluginManifest } from './types';

// Tool naming constants
const PLUGIN_SCHEMA_SEPARATOR = '____';
const PLUGIN_SCHEMA_API_MD5_PREFIX = 'MD5HASH_';

/**
 * Simple hash function for tool name shortening
 */
const genToolCallShortMD5Hash = (name: string): string => {
  // Simple hash function for tool names (fallback if no crypto available)
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).slice(0, 16);
};

/**
 * Generate tool calling name
 * Default tool name generation logic (copied from @lobechat/utils)
 */
export const generateToolName = (identifier: string, name: string, type: string = 'default'): string => {
  const pluginType = type && type !== 'default' ? `${PLUGIN_SCHEMA_SEPARATOR + type}` : '';

  // Use plugin identifier as prefix to avoid conflicts
  let apiName = identifier + PLUGIN_SCHEMA_SEPARATOR + name + pluginType;

  // OpenAI GPT function_call name can't be longer than 64 characters
  // So we need to use hash to shorten the name
  // and then find the correct apiName in response by hash
  if (apiName.length >= 64) {
    const hashContent = PLUGIN_SCHEMA_API_MD5_PREFIX + genToolCallShortMD5Hash(name);
    apiName = identifier + PLUGIN_SCHEMA_SEPARATOR + hashContent + pluginType;
  }

  return apiName;
};

/**
 * Validate manifest schema structure
 */
export function validateManifest(manifest: any): manifest is LobeChatPluginManifest {
  return Boolean(
    manifest &&
      typeof manifest === 'object' &&
      typeof manifest.identifier === 'string' &&
      Array.isArray(manifest.api) &&
      manifest.api.length > 0,
  );
}

/**
 * Filter valid manifest schemas
 */
export function filterValidManifests(manifestSchemas: any[]): {
  invalid: any[];
  valid: LobeChatPluginManifest[];
} {
  const valid: LobeChatPluginManifest[] = [];
  const invalid: any[] = [];

  for (const manifest of manifestSchemas) {
    if (validateManifest(manifest)) {
      valid.push(manifest);
    } else {
      invalid.push(manifest);
    }
  }

  return { invalid, valid };
}
