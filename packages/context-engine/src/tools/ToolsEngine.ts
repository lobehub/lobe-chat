import {
  FunctionCallChecker,
  GenerateToolsParams,
  LobeChatPluginManifest,
  PluginEnableChecker,
  ToolsEngineOptions,
  ToolsGenerationContext,
  ToolsGenerationResult,
  UniformTool,
} from './types';

/**
 * 工具引擎 - 统一处理工具数组的构造和转换
 */
export class ToolsEngine {
  private manifestSchemas: Map<string, LobeChatPluginManifest>;
  private enableChecker?: PluginEnableChecker;
  private functionCallChecker?: FunctionCallChecker;

  constructor(options: ToolsEngineOptions) {
    // 将 manifest schemas 转换为 Map 以提高查找性能
    this.manifestSchemas = new Map(
      options.manifestSchemas.map((schema) => [schema.identifier, schema]),
    );
    this.enableChecker = options.enableChecker;
    this.functionCallChecker = options.functionCallChecker;
  }

  /**
   * 生成工具数组
   * @param params 工具生成参数
   * @returns 处理后的工具数组，如果不应启用工具则返回 undefined
   */
  generateTools(params: GenerateToolsParams): UniformTool[] | undefined {
    const { pluginIds, model, provider, context } = params;

    // 1. 检查模型是否支持 Function Calling
    if (!this.checkFunctionCallSupport(model, provider)) {
      return undefined;
    }

    // 2. 过滤和验证插件
    const { enabledManifests } = this.filterEnabledPlugins(pluginIds, model, provider, context);

    // 3. 如果没有可用工具，返回 undefined
    if (enabledManifests.length === 0) {
      return undefined;
    }

    // 4. 转换为 UniformTool 格式
    return this.convertManifestsToTools(enabledManifests);
  }

  /**
   * 生成工具数组（详细版本）
   * @param params 工具生成参数
   * @returns 详细的工具生成结果
   */
  generateToolsDetailed(params: GenerateToolsParams): ToolsGenerationResult {
    const { pluginIds, model, provider, context } = params;

    // 过滤和验证插件
    const { enabledManifests, filteredPlugins } = this.filterEnabledPlugins(
      pluginIds,
      model,
      provider,
      context,
    );

    // 转换为 UniformTool 格式
    const tools = this.convertManifestsToTools(enabledManifests);

    return {
      enabledPluginIds: enabledManifests.map((m) => m.identifier),
      filteredPlugins,
      tools,
    };
  }

  /**
   * 检查模型是否支持 Function Calling
   */
  private checkFunctionCallSupport(model: string, provider: string): boolean {
    if (this.functionCallChecker) {
      return this.functionCallChecker(model, provider);
    }

    // 默认假设支持 Function Calling
    return true;
  }

  /**
   * 过滤启用的插件
   */
  private filterEnabledPlugins(
    pluginIds: string[],
    model: string,
    provider: string,
    context?: ToolsGenerationContext,
  ): {
    enabledManifests: LobeChatPluginManifest[];
    filteredPlugins: Array<{
      pluginId: string;
      reason: 'not_found' | 'disabled' | 'incompatible';
    }>;
  } {
    const enabledManifests: LobeChatPluginManifest[] = [];
    const filteredPlugins: Array<{
      pluginId: string;
      reason: 'not_found' | 'disabled' | 'incompatible';
    }> = [];

    for (const pluginId of pluginIds) {
      const manifest = this.manifestSchemas.get(pluginId);

      if (!manifest) {
        filteredPlugins.push({ pluginId, reason: 'not_found' });
        continue;
      }

      // 使用注入的检查函数或默认检查逻辑
      const isEnabled = this.enableChecker
        ? this.enableChecker({
            context,
            manifest,
            model,
            pluginId,
            provider,
          })
        : this.defaultEnabledCheck();

      if (isEnabled) {
        enabledManifests.push(manifest);
      } else {
        filteredPlugins.push({ pluginId, reason: 'disabled' });
      }
    }

    return { enabledManifests, filteredPlugins };
  }

  /**
   * 默认的启用检查逻辑
   */
  private defaultEnabledCheck(): boolean {
    // 默认启用所有工具
    return true;
  }

  /**
   * 将 manifest 转换为 UniformTool 数组
   */
  private convertManifestsToTools(manifests: LobeChatPluginManifest[]): UniformTool[] {
    // 使用简化的转换逻辑，避免依赖外部包
    return manifests.flatMap((manifest) =>
      manifest.api.map((api) => ({
        function: {
          description: api.description,
          name: this.generateToolName(manifest.identifier, api.name, manifest.type),
          parameters: api.parameters,
        },
        type: 'function' as const,
      })),
    );
  }

  /**
   * 生成工具调用名称
   */
  private generateToolName(identifier: string, apiName: string, type?: string): string {
    // 简化的工具名称生成逻辑
    if (type === 'builtin') {
      return apiName;
    }
    return `${identifier}____${apiName}`;
  }

  /**
   * 获取可用的插件列表（用于调试和监控）
   */
  getAvailablePlugins(): string[] {
    return Array.from(this.manifestSchemas.keys());
  }

  /**
   * 检查特定插件是否可用
   */
  hasPlugin(pluginId: string): boolean {
    return this.manifestSchemas.has(pluginId);
  }

  /**
   * 获取插件的 manifest
   */
  getPluginManifest(pluginId: string): LobeChatPluginManifest | undefined {
    return this.manifestSchemas.get(pluginId);
  }

  /**
   * 更新插件 manifest schemas（用于动态添加插件）
   */
  updateManifestSchemas(manifestSchemas: LobeChatPluginManifest[]): void {
    this.manifestSchemas.clear();
    for (const schema of manifestSchemas) {
      this.manifestSchemas.set(schema.identifier, schema);
    }
  }

  /**
   * 添加单个插件 manifest
   */
  addPluginManifest(manifest: LobeChatPluginManifest): void {
    this.manifestSchemas.set(manifest.identifier, manifest);
  }

  /**
   * 移除插件 manifest
   */
  removePluginManifest(pluginId: string): boolean {
    return this.manifestSchemas.delete(pluginId);
  }
}
