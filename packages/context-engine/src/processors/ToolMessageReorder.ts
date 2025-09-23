import debug from 'debug';

import { BaseProcessor } from '../base/BaseProcessor';
import type { PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:processor:ToolMessageReorder');

/**
 * Reorder tool messages to ensure that tool messages are displayed in the correct order.
 * see https://github.com/lobehub/lobe-chat/pull/3155
 */
export class ToolMessageReorder extends BaseProcessor {
  readonly name = 'ToolMessageReorder';

  constructor(options: ProcessorOptions = {}) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    // 重新排序消息
    const reorderedMessages = this.reorderToolMessages(clonedContext.messages);

    const originalCount = clonedContext.messages.length;
    const reorderedCount = reorderedMessages.length;

    clonedContext.messages = reorderedMessages;

    // 更新元数据
    clonedContext.metadata.toolMessageReorder = {
      originalCount,
      removedInvalidTools: originalCount - reorderedCount,
      reorderedCount,
    };

    if (originalCount !== reorderedCount) {
      log(
        'Tool message reordering completed, removed',
        originalCount - reorderedCount,
        'invalid tool messages',
      );
    } else {
      log('Tool message reordering completed, message order optimized');
    }

    return this.markAsExecuted(clonedContext);
  }

  /**
   * 重新排序工具消息
   */
  private reorderToolMessages(messages: any[]): any[] {
    // 1. 先收集所有 assistant 消息中的有效 tool_call_id
    const validToolCallIds = new Set<string>();
    messages.forEach((message) => {
      if (message.role === 'assistant' && message.tool_calls) {
        message.tool_calls.forEach((toolCall: any) => {
          validToolCallIds.add(toolCall.id);
        });
      }
    });

    // 2. 收集所有有效的 tool 消息
    const toolMessages: Record<string, any> = {};
    messages.forEach((message) => {
      if (
        message.role === 'tool' &&
        message.tool_call_id &&
        validToolCallIds.has(message.tool_call_id)
      ) {
        toolMessages[message.tool_call_id] = message;
      }
    });

    // 3. 重新排序消息
    const reorderedMessages: any[] = [];
    messages.forEach((message) => {
      // 跳过无效的 tool 消息
      if (
        message.role === 'tool' &&
        (!message.tool_call_id || !validToolCallIds.has(message.tool_call_id))
      ) {
        log('Skipping invalid tool message:', message.id);
        return;
      }

      // 检查是否已经添加过该 tool 消息
      const hasPushed = reorderedMessages.some(
        (m) => !!message.tool_call_id && m.tool_call_id === message.tool_call_id,
      );

      if (hasPushed) return;

      reorderedMessages.push(message);

      // 如果是 assistant 消息且有 tool_calls，添加对应的 tool 消息
      if (message.role === 'assistant' && message.tool_calls) {
        message.tool_calls.forEach((toolCall: any) => {
          const correspondingToolMessage = toolMessages[toolCall.id];
          if (correspondingToolMessage) {
            reorderedMessages.push(correspondingToolMessage);
            delete toolMessages[toolCall.id];
          }
        });
      }
    });

    return reorderedMessages;
  }

  // 简化：移除验证/统计等辅助方法
}
