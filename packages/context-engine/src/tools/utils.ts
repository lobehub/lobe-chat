import { ToolNameResolver } from './ToolNameResolver';
import { LobeChatPluginManifest } from './types';

// Create a singleton instance for backward compatibility
const resolver = new ToolNameResolver();

/**
 * Generate tool calling name
 * @deprecated Use ToolNameResolver.generate() instead
 */
export const generateToolName = (
  identifier: string,
  name: string,
  type: string = 'default',
): string => {
  return resolver.generate(identifier, name, type);
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
