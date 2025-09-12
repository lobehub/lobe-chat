import debug from 'debug';

import { BaseProvider } from '../base/BaseProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:provider:ToolSystemRoleProvider');

/**
 * Tool System Role Configuration
 */
export interface ToolSystemRoleConfig {
  /** Function to get tool system roles */
  getToolSystemRoles: (tools: any[]) => string | undefined;
  /** Function to check if function calling is supported */
  isCanUseFC: (model: string, provider: string) => boolean | undefined;
  /** Model name */
  model: string;
  /** Provider name */
  provider: string;
  /** Available tools list */
  tools?: any[];
}

/**
 * Tool System Role Provider
 * Responsible for injecting tool-related system roles for models that support tool calling
 */
export class ToolSystemRoleProvider extends BaseProvider {
  readonly name = 'ToolSystemRoleProvider';

  constructor(
    private config: ToolSystemRoleConfig,
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    // 检查工具相关条件
    const toolSystemRole = this.getToolSystemRole();

    if (!toolSystemRole) {
      log('No need to inject tool system role, skipping processing');
      return this.markAsExecuted(clonedContext);
    }

    // 注入工具系统角色
    this.injectToolSystemRole(clonedContext, toolSystemRole);

    // 更新元数据
    clonedContext.metadata.toolSystemRole = {
      contentLength: toolSystemRole.length,
      injected: true,
      supportsFunctionCall: this.config.isCanUseFC(this.config.model, this.config.provider),
      toolsCount: this.config.tools?.length || 0,
    };

    log(`Tool system role injection completed, tools count: ${this.config.tools?.length || 0}`);
    return this.markAsExecuted(clonedContext);
  }

  /**
   * Get tool system role content
   */
  private getToolSystemRole(): string | undefined {
    const { tools, model, provider } = this.config;

    // 检查是否有工具
    const hasTools = tools && tools.length > 0;
    if (!hasTools) {
      log('No available tools');
      return undefined;
    }

    // 检查是否支持函数调用
    const hasFC = this.config.isCanUseFC(model, provider);
    if (!hasFC) {
      log(`Model ${model} (${provider}) does not support function calling`);
      return undefined;
    }

    // 获取工具系统角色
    const toolSystemRole = this.config.getToolSystemRoles(tools);
    if (!toolSystemRole) {
      log('Failed to get tool system role content');
      return undefined;
    }

    return toolSystemRole;
  }

  /**
   * Inject tool system role
   */
  private injectToolSystemRole(context: PipelineContext, toolSystemRole: string): void {
    const existingSystemMessage = context.messages.find((msg) => msg.role === 'system');

    if (existingSystemMessage) {
      // 合并到现有系统消息
      existingSystemMessage.content = [existingSystemMessage.content, toolSystemRole]
        .filter(Boolean)
        .join('\n\n');

      log(
        `Tool system role merged to existing system message, final length: ${existingSystemMessage.content.length}`,
      );
    } else {
      context.messages.unshift({
        content: toolSystemRole,
        id: `tool-system-role-${Date.now()}`,
        role: 'system' as const,
      } as any);
      log(`New tool system message created, content length: ${toolSystemRole.length}`);
    }
  }
}
