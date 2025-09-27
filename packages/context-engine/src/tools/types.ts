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
 * 工具生成上下文
 */
export interface ToolsGenerationContext {
  /** 其他扩展上下文 */
  [key: string]: any;
  /** 是否允许图像生成 */
  allowImageGeneration?: boolean;
  /** 环境信息 */
  environment?: 'desktop' | 'web';
  /** 搜索是否启用 */
  isSearchEnabled?: boolean;
}

/**
 * 插件启用检查函数
 */
export type PluginEnableChecker = (params: {
  context?: ToolsGenerationContext;
  manifest: LobeChatPluginManifest;
  model: string;
  pluginId: string;
  provider: string;
}) => boolean;

/**
 * Function Calling 支持检查函数
 */
export type FunctionCallChecker = (model: string, provider: string) => boolean;

/**
 * 工具生成参数
 */
export interface GenerateToolsParams {
  /** 额外的上下文信息 */
  context?: ToolsGenerationContext;
  /** 模型名称 */
  model: string;
  /** 要启用的插件 ID 列表 */
  pluginIds: string[];
  /** 提供商名称 */
  provider: string;
}

/**
 * ToolsEngine 配置选项
 */
export interface ToolsEngineOptions {
  /** 可选的插件启用检查函数 */
  enableChecker?: PluginEnableChecker;
  /** 可选的 Function Calling 支持检查函数 */
  functionCallChecker?: FunctionCallChecker;
  /** 静态注入的 manifest schemas */
  manifestSchemas: LobeChatPluginManifest[];
}

/**
 * 工具生成结果
 */
export interface ToolsGenerationResult {
  /** 启用的插件 ID 列表 */
  enabledPluginIds: string[];
  /** 被过滤掉的插件及原因 */
  filteredPlugins: Array<{
    pluginId: string;
    reason: 'not_found' | 'disabled' | 'incompatible';
  }>;
  /** 生成的工具数组 */
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
