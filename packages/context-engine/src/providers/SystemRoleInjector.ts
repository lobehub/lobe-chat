import debug from 'debug';

import { BaseProvider } from '../base/BaseProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

/**
 * 系统角色注入器
 * 负责在消息列表开头注入系统角色消息
 */
export class SystemRoleInjector extends BaseProvider {
  readonly name = 'SystemRoleInjector';

  private readonly log = debug('context-engine:provider:SystemRoleInjector');

  constructor(
    private systemRole: string,
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    // 如果没有系统角色或系统角色为空，则直接返回
    if (this.isEmptyMessage(this.systemRole)) {
      this.log('系统角色为空，跳过注入');
      return this.markAsExecuted(context);
    }

    const clonedContext = this.cloneContext(context);

    // 检查是否已经存在系统消息
    const existingSystemMessage = clonedContext.messages.find((msg) => msg.role === 'system');

    if (existingSystemMessage) {
      this.log('检测到现有系统消息，进行合并');

      // 合并系统角色内容
      existingSystemMessage.content = [existingSystemMessage.content, this.systemRole]
        .filter(Boolean)
        .join('\n\n');

      this.log(`系统消息合并完成，最终长度: ${existingSystemMessage.content.length}`);
    } else {
      // 创建新的系统消息
      const systemMessage = {
        content: this.systemRole,
        role: 'system',
      };

      // 插入到消息列表开头
      clonedContext.messages.unshift(systemMessage);
      this.log(`新系统消息已注入，消息长度: ${this.systemRole.length}`);
    }

    // 更新元数据
    clonedContext.metadata.systemRoleInjected = true;
    clonedContext.metadata.systemRoleLength = this.systemRole.length;

    return this.markAsExecuted(clonedContext);
  }

  // 简化：不再暴露 set/get 方法，配置通过构造函数一次性传入
}
