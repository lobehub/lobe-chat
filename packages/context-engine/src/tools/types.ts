export interface LobeChatPluginApi {
  description: string;
  name: string;
  parameters: Record<string, any>;
  url?: string;
}

export interface LobeChatPluginManifest {
  api: LobeChatPluginApi[];
  identifier: string;
  meta: any;
  systemRole?: string;
  type?: 'default' | 'standalone' | 'markdown' | 'mcp' | 'builtin';
}

/**
 * Tools generation context
 */
export interface ToolsGenerationContext {
  /** Additional extension context */
  [key: string]: any;
  /** Whether image generation is allowed */
  allowImageGeneration?: boolean;
  /** Environment information */
  environment?: 'desktop' | 'web';
  /** Whether search is enabled */
  isSearchEnabled?: boolean;
}

/**
 * Plugin enable checker function
 */
export type PluginEnableChecker = (params: {
  context?: ToolsGenerationContext;
  manifest: LobeChatPluginManifest;
  model: string;
  pluginId: string;
  provider: string;
}) => boolean;

/**
 * Function calling support checker function
 */
export type FunctionCallChecker = (model: string, provider: string) => boolean;

/**
 * Tools generation parameters
 */
export interface GenerateToolsParams {
  /** Additional context information */
  context?: ToolsGenerationContext;
  /** Model name */
  model: string;
  /** List of plugin IDs to enable */
  pluginIds: string[];
  /** Provider name */
  provider: string;
}

/**
 * ToolsEngine configuration options
 */
export interface ToolsEngineOptions {
  /** Optional plugin enable checker function */
  enableChecker?: PluginEnableChecker;
  /** Optional function calling support checker function */
  functionCallChecker?: FunctionCallChecker;
  /** Statically injected manifest schemas */
  manifestSchemas: LobeChatPluginManifest[];
}

/**
 * Tools generation result
 */
export interface ToolsGenerationResult {
  /** List of enabled plugin IDs */
  enabledPluginIds: string[];
  /** Filtered plugins and their reasons */
  filteredPlugins: Array<{
    pluginId: string;
    reason: 'not_found' | 'disabled' | 'incompatible';
  }>;
  /** Generated tools array */
  tools: UniformTool[];
}

export interface UniformFunctions {
  /**
   * The description of what the function does.
   * @type {string}
   * @memberof UniformFunctions
   */
  description?: string;
  /**
   * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64.
   * @type {string}
   * @memberof UniformFunctions
   */
  name: string;
  /**
   * The parameters the functions accepts, described as a JSON Schema object. See the [guide](/docs/guides/gpt/function-calling) for examples, and the [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for documentation about the format.
   * @type {{ [key: string]: any }}
   * @memberof UniformFunctions
   */
  parameters?: {
    [key: string]: any;
  };
}

export interface UniformTool {
  function: UniformFunctions;

  /**
   * The type of the tool. Currently, only `function` is supported.
   */
  type: 'function';
}
