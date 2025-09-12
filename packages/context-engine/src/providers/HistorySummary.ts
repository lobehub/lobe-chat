import debug from 'debug';

import { BaseProvider } from '../base/BaseProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:provider:HistorySummaryProvider');

/**
 * History Summary Configuration
 */
export interface HistorySummaryConfig {
  /** History summary template function */
  formatHistorySummary?: (summary: string) => string;
  /** History summary content */
  historySummary?: string;
}

/**
 * Default history summary formatter function
 */
const defaultHistorySummaryFormatter = (historySummary: string): string => `<chat_history_summary>
<docstring>Users may have lots of chat messages, here is the summary of the history:</docstring>
<summary>${historySummary}</summary>
</chat_history_summary>`;

/**
 * History Summary Provider
 * Responsible for injecting history conversation summary into system messages
 */
export class HistorySummaryProvider extends BaseProvider {
  readonly name = 'HistorySummaryProvider';

  constructor(
    private config: HistorySummaryConfig,
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    // 检查是否有历史摘要
    if (!this.config.historySummary) {
      log('No history summary content, skipping processing');
      return this.markAsExecuted(clonedContext);
    }

    // 格式化历史摘要
    const formattedSummary = this.formatHistorySummary(this.config.historySummary);

    // 注入历史摘要
    this.injectHistorySummary(clonedContext, formattedSummary);

    // 更新元数据
    clonedContext.metadata.historySummary = {
      formattedLength: formattedSummary.length,
      injected: true,
      originalLength: this.config.historySummary.length,
    };

    log(
      `History summary injection completed, original length: ${this.config.historySummary.length}, formatted length: ${formattedSummary.length}`,
    );
    return this.markAsExecuted(clonedContext);
  }

  /**
   * Format history summary
   */
  private formatHistorySummary(historySummary: string): string {
    const formatter = this.config.formatHistorySummary || defaultHistorySummaryFormatter;
    return formatter(historySummary);
  }

  /**
   * Inject history summary to system message
   */
  private injectHistorySummary(context: PipelineContext, formattedSummary: string): void {
    const existingSystemMessage = context.messages.find((msg) => msg.role === 'system');

    if (existingSystemMessage) {
      // 合并到现有系统消息
      existingSystemMessage.content = [existingSystemMessage.content, formattedSummary]
        .filter(Boolean)
        .join('\n\n');

      log(
        `History summary merged to existing system message, final length: ${existingSystemMessage.content.length}`,
      );
    } else {
      // 创建新的系统消息
      const systemMessage = {
        content: formattedSummary,
        role: 'system' as const,
      };

      context.messages.unshift(systemMessage as any);
      log(`New history summary system message created, content length: ${formattedSummary.length}`);
    }
  }
}
