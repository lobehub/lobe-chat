import debug from 'debug';

import { BaseProvider } from '../base/BaseProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:provider:ToolSystemRoleProvider');

/**
 * 工具系统角色配置
 */
export interface ToolSystemRoleConfig {
  /** 工具系统角色获取函数 */
  getToolSystemRoles: (tools: any[]) => string | undefined;
  /** 检查是否支持函数调用的函数 */
  isCanUseFC: (model: string, provider: string) => boolean | undefined;
  /** 模型名称 */
  model: string;
  /** 提供商名称 */
  provider: string;
  /** 可用工具列表 */
  tools?: any[];
}

/**
 * 工具系统角色提供者
 * 负责为支持工具调用的模型注入工具相关的系统角色
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
      log('无需注入工具系统角色，跳过处理');
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

    log(`工具系统角色注入完成，工具数量: ${this.config.tools?.length || 0}`);
    return this.markAsExecuted(clonedContext);
  }

  /**
   * 获取工具系统角色内容
   */
  private getToolSystemRole(): string | undefined {
    const { tools, model, provider } = this.config;

    // 检查是否有工具
    const hasTools = tools && tools.length > 0;
    if (!hasTools) {
      log('无可用工具');
      return undefined;
    }

    // 检查是否支持函数调用
    const hasFC = this.config.isCanUseFC(model, provider);
    if (!hasFC) {
      log(`模型 ${model} (${provider}) 不支持函数调用`);
      return undefined;
    }

    // 获取工具系统角色
    const toolSystemRole = this.config.getToolSystemRoles(tools);
    if (!toolSystemRole) {
      log('未获取到工具系统角色内容');
      return undefined;
    }

    return toolSystemRole;
  }

  /**
   * 注入工具系统角色
   */
  private injectToolSystemRole(context: PipelineContext, toolSystemRole: string): void {
    const existingSystemMessage = context.messages.find((msg) => msg.role === 'system');

    if (existingSystemMessage) {
      // 合并到现有系统消息
      existingSystemMessage.content = [existingSystemMessage.content, toolSystemRole]
        .filter(Boolean)
        .join('\n\n');

      log(`工具系统角色已合并到现有系统消息，最终长度: ${existingSystemMessage.content.length}`);
    } else {
      context.messages.unshift({
        content: toolSystemRole,
        id: `tool-system-role-${Date.now()}`,
        role: 'system' as const,
      } as any);
      log(`新的工具系统消息已创建，内容长度: ${toolSystemRole.length}`);
    }
  }
}
