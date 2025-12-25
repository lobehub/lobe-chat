import { BuiltinStreaming } from '@lobechat/types';

/**
 * Builtin tools streaming renderer registry
 * Organized by toolset (identifier) -> API name
 *
 * Streaming components are used to render tool calls while they are
 * still executing, allowing real-time feedback to users.
 * The component should fetch streaming content from store internally.
 */
const BuiltinToolStreamings: Record<string, Record<string, BuiltinStreaming>> = {
  // Example:
  // [CodeInterpreterManifest.identifier]: {
  //   [CodeInterpreterApiName.executeCode]: ExecuteCodeStreaming,
  // },
};

/**
 * Get builtin streaming component for a specific API
 * @param identifier - Tool identifier (e.g., 'lobe-code-interpreter')
 * @param apiName - API name (e.g., 'executeCode')
 */
export const getBuiltinStreaming = (
  identifier?: string,
  apiName?: string,
): BuiltinStreaming | undefined => {
  if (!identifier || !apiName) return undefined;

  const toolset = BuiltinToolStreamings[identifier];
  if (!toolset) return undefined;

  return toolset[apiName];
};
