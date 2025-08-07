import debug from 'debug';

import { BaseProcessor } from '../base/BaseProcessor';
import type { PipelineContext, ProcessorOptions, TokenCounter } from '../types';

const log = debug('context-engine:processor:HistoryTruncator');

/**
 * 历史截断器配置
 */
export interface HistoryTruncatorConfig {
  /** 保留的最新消息数量 */
  keepLatestN?: number;
  /** 最大 token 限制 */
  maxTokens?: number;
  /** 是否包括新用户消息 */
  includeNewUserMessage?: boolean;
  /** Token 计数器 */
  tokenCounter?: TokenCounter;
  /** 保留的消息类型优先级 */
  messageTypePriority?: ('system' | 'user' | 'assistant' | 'tool')[];
}

/**
 * 历史截断器
 * 基于数量或 Token 限制对历史消息进行智能截断
 */
export class HistoryTruncator extends BaseProcessor {
  readonly name = 'HistoryTruncator';

  constructor(
    private config: HistoryTruncatorConfig = {},
    options: ProcessorOptions = {},
  ) {
    super(options);

    // 设置默认配置
    this.config = {
      keepLatestN: 10,
      includeNewUserMessage: true,
      messageTypePriority: ['system', 'user', 'assistant', 'tool'],
      ...config,
    };
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    const originalCount = clonedContext.messages.length;

    if (originalCount === 0) {
      log('No messages need truncation');
      return this.markAsExecuted(clonedContext);
    }

    // 分离系统消息和其他消息
    const systemMessages = clonedContext.messages.filter((msg) => msg.role === 'system');
    const nonSystemMessages = clonedContext.messages.filter((msg) => msg.role !== 'system');

    let truncatedMessages = nonSystemMessages;

    // 1. 基于数量的截断
    if (this.config.keepLatestN !== undefined) {
      truncatedMessages = this.truncateByCount(truncatedMessages);
    }

    // 2. 基于 Token 的截断
    if (this.config.maxTokens && this.config.tokenCounter) {
      truncatedMessages = await this.truncateByTokens(truncatedMessages, systemMessages);
    }

    // 重新组合消息（系统消息在前）
    clonedContext.messages = [...systemMessages, ...truncatedMessages];

    const finalCount = clonedContext.messages.length;
    const removedCount = originalCount - finalCount;

    // 更新元数据
    clonedContext.metadata.historyTruncation = {
      originalCount,
      finalCount,
      removedCount,
      keepLatestN: this.config.keepLatestN,
      maxTokens: this.config.maxTokens,
      truncationMethod: this.getTruncationMethod(),
    };

    log(
      'History truncation completed, original',
      originalCount,
      'messages, kept',
      finalCount,
      'removed',
      removedCount,
    );

    return this.markAsExecuted(clonedContext);
  }

  /**
   * 基于数量的截断
   */
  private truncateByCount(messages: any[]): any[] {
    if (!this.config.keepLatestN || messages.length <= this.config.keepLatestN) {
      return messages;
    }

    const messagesCount = this.config.includeNewUserMessage
      ? this.config.keepLatestN + 1
      : this.config.keepLatestN;

    if (messagesCount <= 0) {
      return [];
    }

    const truncated = messages.slice(-messagesCount);
    log('Count-based truncation, keeping latest', truncated.length, 'messages');

    return truncated;
  }

  /**
   * 基于 Token 的截断
   */
  private async truncateByTokens(messages: any[], systemMessages: any[]): Promise<any[]> {
    if (!this.config.tokenCounter || !this.config.maxTokens) {
      return messages;
    }

    // 计算系统消息的 token 数量
    const systemTokens =
      systemMessages.length > 0
        ? await this.config.tokenCounter.count(systemMessages.map((m) => m.content).join('\n'))
        : 0;

    const availableTokens = this.config.maxTokens * 0.9 - systemTokens; // 留 10% 冗余

    if (availableTokens <= 0) {
      log('System messages exceed token limit, returning empty history');
      return [];
    }

    // 从后往前累计 token，直到达到限制
    const truncatedHistory: any[] = [];
    let currentTokens = 0;

    for (const message of [...messages].reverse()) {
      const messageTokens = await this.config.tokenCounter.count(message.content);

      if (currentTokens + messageTokens > availableTokens) {
        // 检查是否可以部分截断消息内容
        const remainingTokens = availableTokens - currentTokens;
        if (remainingTokens > 100) {
          // 至少保留100个token的内容
          const partialMessage = await this.truncateMessageContent(message, remainingTokens);
          if (partialMessage) {
            truncatedHistory.unshift(partialMessage);
          }
        }
        break;
      }

      truncatedHistory.unshift(message);
      currentTokens += messageTokens;
    }

    log(
      'Token-based truncation, using',
      currentTokens + '/' + availableTokens,
      'tokens, keeping',
      truncatedHistory.length,
      'messages',
    );

    return truncatedHistory;
  }

  /**
   * 截断单条消息的内容
   */
  private async truncateMessageContent(message: any, maxTokens: number): Promise<any | null> {
    if (!this.config.tokenCounter) return null;

    const content = message.content;
    if (!content || typeof content !== 'string') return null;

    // 二分查找合适的截断长度
    let left = 0;
    let right = content.length;
    let bestLength = 0;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const truncatedContent = content.substring(0, mid) + '...';
      const tokens = await this.config.tokenCounter.count(truncatedContent);

      if (tokens <= maxTokens) {
        bestLength = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    if (bestLength > 50) {
      // 至少保留50个字符
      return {
        ...message,
        content: content.substring(0, bestLength) + '...',
      };
    }

    return null;
  }

  /**
   * 获取截断方法描述
   */
  private getTruncationMethod(): string {
    const methods: string[] = [];

    if (this.config.keepLatestN !== undefined) {
      methods.push(`count(${this.config.keepLatestN})`);
    }

    if (this.config.maxTokens && this.config.tokenCounter) {
      methods.push(`tokens(${this.config.maxTokens})`);
    }

    return methods.join(' + ') || 'none';
  }

  // 简化：移除 set/get/估算/needs 等辅助接口
}
