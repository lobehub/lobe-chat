import debug from 'debug';

import { BaseProcessor } from '../base/BaseProcessor';
import type { MessageToolCall, PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:processor:ToolCallProcessor');

export interface ToolCallConfig {
  /** Function to generate tool calling name */
  genToolCallingName?: (identifier: string, apiName: string, type?: string) => string;
  /** Function to check if function calling is supported */
  isCanUseFC?: (model: string, provider: string) => boolean;
  /** Model name */
  model: string;
  /** Provider name */
  provider: string;
}

/**
 * Tool Call Processor
 * Responsible for converting ChatMessage format tool calls to OpenAI format
 */
export class ToolCallProcessor extends BaseProcessor {
  readonly name = 'ToolCallProcessor';

  constructor(
    private config: ToolCallConfig,
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    const supportTools = this.config.isCanUseFC
      ? this.config.isCanUseFC(this.config.model, this.config.provider)
      : true;

    let processedCount = 0;
    let toolCallsConverted = 0;
    let toolMessagesConverted = 0;

    // 处理每条消息的工具调用
    for (let i = 0; i < clonedContext.messages.length; i++) {
      const message = clonedContext.messages[i];

      try {
        const updatedMessage = await this.processMessage(message, supportTools);

        if (updatedMessage !== message) {
          processedCount++;
          clonedContext.messages[i] = updatedMessage;

          // 统计转换的工具调用和工具消息数量
          if (message.role === 'assistant' && message.tools) {
            toolCallsConverted += message.tools.length;
          }
          if (message.role === 'tool') {
            toolMessagesConverted++;
          }

          log(`处理消息 ${message.id}，角色: ${message.role}`);
        }
      } catch (error) {
        log.extend('error')(`处理消息 ${message.id} 工具调用时出错: ${error}`);
        // 继续处理其他消息
      }
    }

    // 更新元数据
    clonedContext.metadata.toolCallProcessed = processedCount;
    clonedContext.metadata.toolCallsConverted = toolCallsConverted;
    clonedContext.metadata.toolMessagesConverted = toolMessagesConverted;
    clonedContext.metadata.supportTools = supportTools;

    log(
      `Tool call processing completed, processed ${processedCount} messages, converted ${toolCallsConverted} tool calls, ${toolMessagesConverted} tool messages`,
    );

    return this.markAsExecuted(clonedContext);
  }

  /**
   * 处理单条消息的工具调用
   */
  private async processMessage(message: any, supportTools: boolean): Promise<any> {
    switch (message.role) {
      case 'assistant': {
        return this.processAssistantMessage(message, supportTools);
      }

      case 'tool': {
        return this.processToolMessage(message, supportTools);
      }

      default: {
        return message;
      }
    }
  }

  /**
   * 处理助手消息的工具调用
   */
  private processAssistantMessage(message: any, supportTools: boolean): any {
    // 检查是否有工具调用
    const hasTools = message.tools && message.tools.length > 0;
    const hasEmptyToolCalls = message.tool_calls && message.tool_calls.length === 0;

    if (!supportTools || (!hasTools && hasEmptyToolCalls)) {
      // 如果不支持工具或只有空的工具调用，返回普通消息（移除工具相关属性）
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tools, tool_calls, ...messageWithoutTools } = message;
      return messageWithoutTools;
    }

    if (!hasTools) {
      // 如果没有 tools 但有其他工具调用属性，只移除 tools
      return message;
    }

    // 将 tools 转换为 tool_calls 格式
    const tool_calls = message.tools.map(
      (tool: any): MessageToolCall => ({
        function: {
          arguments: tool.arguments,
          name: this.config.genToolCallingName
            ? this.config.genToolCallingName(tool.identifier, tool.apiName, tool.type)
            : `${tool.identifier}.${tool.apiName}`,
        },
        id: tool.id,
        type: 'function',
      }),
    );

    return { ...message, tool_calls };
  }

  /**
   * 处理工具消息
   */
  private processToolMessage(message: any, supportTools: boolean): any {
    if (!supportTools) {
      // 如果不支持工具，将工具消息转换为用户消息
      return {
        ...message,
        name: undefined,
        plugin: undefined,
        role: 'user',
        tool_call_id: undefined,
      };
    }

    // 生成工具名称
    const toolName = message.plugin
      ? this.config.genToolCallingName
        ? this.config.genToolCallingName(
            message.plugin.identifier,
            message.plugin.apiName,
            message.plugin.type,
          )
        : `${message.plugin.identifier}.${message.plugin.apiName}`
      : undefined;

    return {
      ...message,
      name: toolName,
      // 保留 tool_call_id 用于关联
    };
  }

  /**
   * 验证工具调用格式
   */
  private validateToolCall(tool: any): boolean {
    return !!(tool && tool.id && tool.identifier && tool.apiName && tool.arguments);
  }

  /**
   * 验证工具消息格式
   */
  private validateToolMessage(message: any): boolean {
    return !!(message && message.tool_call_id && message.content !== undefined);
  }
}
