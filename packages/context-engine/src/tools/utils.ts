import { LobeChatPluginManifest } from './types';

/**
 * 验证 manifest schema 的基本结构
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
 * 过滤有效的 manifest schemas
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
