import debug from 'debug';

import { BaseProcessor } from '../base/BaseProcessor';
import type { PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:processor:PlaceholderVariablesProcessor');

const placeholderVariablesRegex = /{{(.*?)}}/g;

export interface PlaceholderVariablesConfig {
  /** 递归解析深度，默认为 2 */
  depth?: number;
  /** 变量生成器映射，key 为变量名，value 为生成函数 */
  variableGenerators: Record<string, () => string>;
}

/**
 * 从文本中提取所有 {{variable}} 占位符的变量名
 * @param text 包含模板变量的字符串
 * @returns 变量名数组，如 ['date', 'nickname']
 */
const extractPlaceholderVariables = (text: string): string[] => {
  const matches = [...text.matchAll(placeholderVariablesRegex)];
  return matches.map((m) => m[1].trim());
};

/**
 * 将模板变量替换为实际值，并支持递归解析嵌套变量
 * @param text - 含变量的原始文本
 * @param variableGenerators - 变量生成器映射
 * @param depth - 递归深度，默认 2，设置更高可支持 {{text}} 中的 {{date}} 等
 * @returns 替换后的文本
 */
export const parsePlaceholderVariables = (
  text: string,
  variableGenerators: Record<string, () => string>,
  depth = 2,
): string => {
  let result = text;

  // 递归解析，用于处理如 {{text}} 存在额外预设变量
  for (let i = 0; i < depth; i++) {
    try {
      const extractedVariables = extractPlaceholderVariables(result);
      const availableVariables = Object.fromEntries(
        extractedVariables
          .map((key) => [key, variableGenerators[key]?.()])
          .filter(([, value]) => value !== undefined),
      );

      // 只有当有可用变量时才进行替换
      if (Object.keys(availableVariables).length === 0) break;

      // 逐个替换变量，避免 lodash template 对未定义变量的错误处理
      let tempResult = result;
      for (const [key, value] of Object.entries(availableVariables)) {
        const regex = new RegExp(
          `{{\\s*${key.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&')}\\s*}}`,
          'g',
        );
        // @ts-ignore
        tempResult = tempResult.replace(regex, value);
      }

      if (tempResult === result) break;
      result = tempResult;
    } catch {
      break;
    }
  }

  return result;
};

/**
 * 解析消息内容，替换占位符变量
 * @param messages 原始消息数组
 * @param variableGenerators 变量生成器映射
 * @param depth 递归解析深度，默认为 2
 * @returns 处理后的消息数组
 */
export const parsePlaceholderVariablesMessages = (
  messages: any[],
  variableGenerators: Record<string, () => string>,
  depth = 2,
): any[] =>
  messages.map((message) => {
    if (!message?.content) return message;

    const { content } = message;

    // 字符串类型直接处理
    if (typeof content === 'string') {
      return { ...message, content: parsePlaceholderVariables(content, variableGenerators, depth) };
    }

    // 数组类型处理其中的 text 元素
    if (Array.isArray(content)) {
      return {
        ...message,
        content: content.map((item) =>
          item?.type === 'text'
            ? { ...item, text: parsePlaceholderVariables(item.text, variableGenerators, depth) }
            : item,
        ),
      };
    }

    return message;
  });

/**
 * PlaceholderVariables Processor
 * 负责处理消息中的占位符变量替换
 */
export class PlaceholderVariablesProcessor extends BaseProcessor {
  readonly name = 'PlaceholderVariablesProcessor';

  constructor(
    private config: PlaceholderVariablesConfig,
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    let processedCount = 0;
    const depth = this.config.depth ?? 2;

    log(
      `Starting placeholder variables processing with ${Object.keys(this.config.variableGenerators).length} generators`,
    );

    // 处理每条消息的占位符变量
    for (let i = 0; i < clonedContext.messages.length; i++) {
      const message = clonedContext.messages[i];

      try {
        const originalMessage = JSON.stringify(message);
        const processedMessage = this.processMessagePlaceholders(message, depth);

        if (JSON.stringify(processedMessage) !== originalMessage) {
          clonedContext.messages[i] = processedMessage;
          processedCount++;
          log(`Processed placeholders in message ${message.id}, role: ${message.role}`);
        }
      } catch (error) {
        log.extend('error')(`Error processing placeholders in message ${message.id}: ${error}`);
        // 继续处理其他消息
      }
    }

    // 更新元数据
    clonedContext.metadata.placeholderVariablesProcessed = processedCount;

    log(`Placeholder variables processing completed, processed ${processedCount} messages`);

    return this.markAsExecuted(clonedContext);
  }

  /**
   * 处理单个消息的占位符变量
   */
  private processMessagePlaceholders(message: any, depth: number): any {
    if (!message?.content) return message;

    const { content } = message;

    // 字符串类型直接处理
    if (typeof content === 'string') {
      return {
        ...message,
        content: parsePlaceholderVariables(content, this.config.variableGenerators, depth),
      };
    }

    // 数组类型处理其中的 text 元素
    if (Array.isArray(content)) {
      return {
        ...message,
        content: content.map((item) =>
          item?.type === 'text'
            ? {
                ...item,
                text: parsePlaceholderVariables(item.text, this.config.variableGenerators, depth),
              }
            : item,
        ),
      };
    }

    return message;
  }
}
