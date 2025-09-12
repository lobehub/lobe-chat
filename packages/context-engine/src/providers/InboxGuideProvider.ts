import debug from 'debug';

import { BaseProvider } from '../base/BaseProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:provider:InboxGuideProvider');

/**
 * Inbox Guide System Role Configuration
 */
export interface InboxGuideConfig {
  /** Inbox guide system role content */
  inboxGuideSystemRole: string;
  /** Inbox session ID constant */
  inboxSessionId: string;
  /** Whether it's a welcome question */
  isWelcomeQuestion?: boolean;
  /** Session ID */
  sessionId?: string;
}

/**
 * Inbox Guide Provider
 * Responsible for injecting guide system role for welcome questions in inbox sessions
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
      log('Inbox guide injection conditions not met, skipping processing');
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

    log('Inbox guide system role injection completed');
    return this.markAsExecuted(clonedContext);
  }

  /**
   * Check if inbox guide should be injected
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
   * Inject inbox guide system role
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

      log(
        `Inbox guide merged to existing system message, final length: ${existingSystemMessage.content.length}`,
      );
    } else {
      context.messages.unshift({
        content: this.config.inboxGuideSystemRole,
        role: 'system' as const,
      } as any);
      log(
        `New inbox guide system message created, content length: ${this.config.inboxGuideSystemRole.length}`,
      );
    }
  }
}
