import debug from 'debug';

import { BaseProvider } from '../base/BaseProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:provider:HistorySummaryProvider');

/**
 * 历史摘要配置
 */
export interface HistorySummaryConfig {
  /** 历史摘要模板函数 */
  formatHistorySummary?: (summary: string) => string;
  /** 历史摘要内容 */
  historySummary?: string;
}

/**
 * 默认历史摘要格式化函数
 */
const defaultHistorySummaryFormatter = (historySummary: string): string => `<chat_history_summary>
<docstring>Users may have lots of chat messages, here is the summary of the history:</docstring>
<summary>${historySummary}</summary>
</chat_history_summary>`;

/**
 * 历史摘要提供者
 * 负责将历史对话摘要注入到系统消息中
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
      log('无历史摘要内容，跳过处理');
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
      `历史摘要注入完成，原始长度: ${this.config.historySummary.length}, 格式化后长度: ${formattedSummary.length}`,
    );
    return this.markAsExecuted(clonedContext);
  }

  /**
   * 格式化历史摘要
   */
  private formatHistorySummary(historySummary: string): string {
    const formatter = this.config.formatHistorySummary || defaultHistorySummaryFormatter;
    return formatter(historySummary);
  }

  /**
   * 注入历史摘要到系统消息
   */
  private injectHistorySummary(context: PipelineContext, formattedSummary: string): void {
    const existingSystemMessage = context.messages.find((msg) => msg.role === 'system');

    if (existingSystemMessage) {
      // 合并到现有系统消息
      existingSystemMessage.content = [existingSystemMessage.content, formattedSummary]
        .filter(Boolean)
        .join('\n\n');

      log(`历史摘要已合并到现有系统消息，最终长度: ${existingSystemMessage.content.length}`);
    } else {
      // 创建新的系统消息
      const systemMessage = {
        content: formattedSummary,
        role: 'system' as const,
      };

      context.messages.unshift(systemMessage as any);
      log(`新的历史摘要系统消息已创建，内容长度: ${formattedSummary.length}`);
    }
  }
}
