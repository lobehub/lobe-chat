import debug from 'debug';

import { BaseProvider } from '../base/BaseProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:provider:InboxGuideProvider');

/**
 * 收件箱引导系统角色配置
 */
export interface InboxGuideConfig {
  /** 收件箱引导系统角色内容 */
  inboxGuideSystemRole: string;
  /** 收件箱会话ID常量 */
  inboxSessionId: string;
  /** 是否为欢迎问题 */
  isWelcomeQuestion?: boolean;
  /** 会话ID */
  sessionId?: string;
}

/**
 * 收件箱引导提供者
 * 负责为收件箱会话的欢迎问题注入引导系统角色
 */
export class InboxGuideProvider extends BaseProvider {
  readonly name = 'InboxGuideProvider';

  constructor(
    private config: InboxGuideConfig,
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    // 检查是否需要注入收件箱引导
    const shouldInject = this.shouldInjectInboxGuide();

    if (!shouldInject) {
      log('不满足收件箱引导注入条件，跳过处理');
      return this.markAsExecuted(clonedContext);
    }

    // 注入收件箱引导系统角色
    this.injectInboxGuideSystemRole(clonedContext);

    // 更新元数据
    clonedContext.metadata.inboxGuide = {
      contentLength: this.config.inboxGuideSystemRole.length,
      injected: true,
      isWelcomeQuestion: this.config.isWelcomeQuestion,
      sessionId: this.config.sessionId,
    };

    log('收件箱引导系统角色注入完成');
    return this.markAsExecuted(clonedContext);
  }

  /**
   * 检查是否应该注入收件箱引导
   */
  private shouldInjectInboxGuide(): boolean {
    return (
      (this.config.isWelcomeQuestion &&
        this.config.sessionId === this.config.inboxSessionId &&
        !!this.config.inboxGuideSystemRole) ||
      false
    );
  }

  /**
   * 注入收件箱引导系统角色
   */
  private injectInboxGuideSystemRole(context: PipelineContext): void {
    const existingSystemMessage = context.messages.find((msg) => msg.role === 'system');

    if (existingSystemMessage) {
      // 合并到现有系统消息
      existingSystemMessage.content = [
        existingSystemMessage.content,
        this.config.inboxGuideSystemRole,
      ]
        .filter(Boolean)
        .join('\n\n');

      log(`收件箱引导已合并到现有系统消息，最终长度: ${existingSystemMessage.content.length}`);
    } else {
      context.messages.unshift({
        content: this.config.inboxGuideSystemRole,
        role: 'system' as const,
      } as any);
      log(`新的收件箱引导系统消息已创建，内容长度: ${this.config.inboxGuideSystemRole.length}`);
    }
  }
}
