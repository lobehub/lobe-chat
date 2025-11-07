import debug from 'debug';

import { BaseProcessor } from '../base/BaseProcessor';
import type { PipelineContext, ProcessorOptions } from '../types';

interface MessageCleanupConfig {
  includeHistoricalThinking?: boolean;
  provider?: string;
}

const log = debug('context-engine:processor:MessageCleanupProcessor');

/**
 * 消息清理处理器
 * 负责清理消息中的多余字段，只保留 OpenAI 格式所需的必要字段
 */
export class MessageCleanupProcessor extends BaseProcessor {
  readonly name = 'MessageCleanupProcessor';

  private readonly config: MessageCleanupConfig;

  constructor(
    configOrOptions: MessageCleanupConfig | ProcessorOptions = {},
    options: ProcessorOptions = {},
  ) {
    if (MessageCleanupProcessor.isProcessorOptions(configOrOptions)) {
      super(configOrOptions);
      this.config = {};
    } else {
      super(options);
      this.config = configOrOptions;
    }
  }

  private static isProcessorOptions(value: any): value is ProcessorOptions {
    if (!value || typeof value !== 'object') return false;
    const keys = Object.keys(value);
    if (keys.length === 0) return false;
    return keys.every((key) => key === 'debug' || key === 'logger');
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    let cleanedCount = 0;

    // 清理每条消息，只保留必要字段
    for (let i = 0; i < clonedContext.messages.length; i++) {
      const message = clonedContext.messages[i];
      const cleanedMessage = this.cleanMessage(message);

      if (cleanedMessage !== message) {
        clonedContext.messages[i] = cleanedMessage;
        cleanedCount++;
      }
    }

    // 更新元数据
    clonedContext.metadata.messageCleanup = {
      cleanedCount,
      totalMessages: clonedContext.messages.length,
    };

    log(`Message cleanup completed, cleaned ${cleanedCount} messages`);
    return this.markAsExecuted(clonedContext);
  }

  /**
   * 清理单条消息，只保留必要字段
   */
  private cleanMessage(message: any): any {
    switch (message.role) {
      case 'system': {
        return {
          content: message.content,
          role: message.role,
        };
      }

      case 'user': {
        return {
          content: message.content,
          role: message.role,
        };
      }

      case 'assistant': {
        const baseMessage = {
          content: message.content,
          role: message.role,
          ...(message.tool_calls && { tool_calls: message.tool_calls }),
        };

        const shouldPreserveReasoning = (() => {
          if (!this.config.includeHistoricalThinking) return false;
          const provider = this.config.provider?.toLowerCase();
          if (!provider) return false;
          if (provider !== 'minimax' && provider !== 'moonshot') return false;
          if (!message.reasoning) return false;
          const { content, signature } = message.reasoning;
          return !!content && !signature;
        })();

        if (shouldPreserveReasoning) {
          return {
            ...baseMessage,
            reasoning: message.reasoning,
          };
        }

        return baseMessage;
      }

      case 'tool': {
        return {
          content: message.content,
          role: message.role,
          tool_call_id: message.tool_call_id,
          ...(message.name && { name: message.name }),
        };
      }

      default: {
        // 对于未知角色，保持原样
        return message;
      }
    }
  }
}
