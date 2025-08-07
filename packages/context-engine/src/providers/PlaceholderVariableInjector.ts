import debug from 'debug';
import { template } from 'lodash-es';

import { BaseProvider } from '../base/BaseProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:processor:PlaceholderVariableInjector');

/**
 * 占位符变量注入器
 * 负责解析和替换消息中的占位符变量
 */
export class PlaceholderVariableInjector extends BaseProvider {
  readonly name = 'PlaceholderVariableInjector';

  constructor(
    private variables: Record<string, any> = {},
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    if (Object.keys(this.variables).length === 0) {
      log('没有占位符变量需要处理');
      return this.markAsExecuted(clonedContext);
    }

    let processedCount = 0;
    let errorCount = 0;

    // 处理每条消息的占位符
    clonedContext.messages = clonedContext.messages.map((message) => {
      try {
        const originalContent = message.content as string;

        // 检查是否包含占位符
        if (!this.hasPlaceholders(originalContent)) {
          return message;
        }

        // 使用 lodash template 处理占位符
        const compiled = template(originalContent, {
          // 支持 {{variable}} 格式
          escape: /{{{(.+?)}}}/g,
          // 支持 {{{variable}}} 格式（HTML 转义）
          evaluate: /{%(.+?)%}/g,
          interpolate: /{{(.+?)}}/g, // 支持 {% code %} 格式（代码执行）
        });

        const processedContent = compiled(this.variables);

        if (processedContent !== originalContent) {
          processedCount++;
          log(`消息 ${message.id} 的占位符已替换`);
        }

        return {
          ...message,
          content: processedContent,
        };
      } catch (error) {
        errorCount++;
        log.extend('error')(`处理消息 ${message.id} 占位符时出错: ${error}`);
        // 出错时返回原消息
        return message;
      }
    });

    // 更新元数据
    clonedContext.metadata.placeholdersProcessed = processedCount;
    clonedContext.metadata.placeholderErrors = errorCount;
    clonedContext.metadata.availableVariables = Object.keys(this.variables);

    log(`占位符处理完成，成功处理 ${processedCount} 条消息，错误 ${errorCount} 条`);

    return this.markAsExecuted(clonedContext);
  }

  /**
   * 检查文本是否包含占位符
   */
  private hasPlaceholders(text: string): boolean {
    if (!text || typeof text !== 'string') return false;

    const patterns = [
      /{{.+?}}/, // {{variable}}
      /{{{.+?}}}/, // {{{variable}}}
      /{%.+?%}/, // {% code %}
    ];

    return patterns.some((pattern) => pattern.test(text));
  }

  /**
   * 设置变量
   */
  // 简化：移除变量 set/get/clear 方法，变量通过构造函数一次性传入

  /**
   * 预览占位符替换结果（不修改原消息）
   */
  preview(text: string): { hasChanges: boolean; original: string; processed: string } {
    try {
      if (!this.hasPlaceholders(text)) {
        return {
          hasChanges: false,
          original: text,
          processed: text,
        };
      }

      const compiled = template(text, {
        escape: /{{{(.+?)}}}/g,
        evaluate: /{%(.+?)%}/g,
        interpolate: /{{(.+?)}}/g,
      });

      const processed = compiled(this.variables);

      return {
        hasChanges: processed !== text,
        original: text,
        processed,
      };
    } catch {
      return {
        hasChanges: false,
        original: text,
        processed: text,
      };
    }
  }

  /**
   * 获取文本中的所有占位符
   */
  extractPlaceholders(text: string): string[] {
    if (!text || typeof text !== 'string') return [];

    const placeholders: string[] = [];
    const patterns = [/{{(.+?)}}/g, /{{{(.+?)}}}/g, /{%(.+?)%}/g];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        placeholders.push(match[1].trim());
      }
    });

    return [...new Set(placeholders)]; // 去重
  }
}
