import debug from 'debug';
import { template } from 'lodash-es';

import { BaseProvider } from '../base/BaseProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

/**
 * 输入模板注入器
 * 负责对用户输入消息应用模板转换
 */
export class InputTemplateInjector extends BaseProvider {
  readonly name = 'InputTemplateInjector';

  private readonly log = debug('context-engine:provider:InputTemplateInjector');

  constructor(
    private inputTemplate?: string,
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    // 如果没有输入模板，直接返回
    if (!this.inputTemplate || this.inputTemplate.trim() === '') {
      this.log('没有输入模板需要应用');
      return this.markAsExecuted(clonedContext);
    }

    let processedCount = 0;
    let errorCount = 0;

    try {
      // 编译模板
      const compiledTemplate = template(this.inputTemplate, {
        interpolate: /\{\{\s*(text)\s*\}\}/g, // 支持 {{ text }} 格式
      });

      // 处理所有用户消息
      clonedContext.messages = clonedContext.messages.map((message) => {
        if (message.role !== 'user') {
          return message;
        }

        try {
          const originalContent = message.content;

          // 应用模板转换
          const transformedContent = compiledTemplate({ text: originalContent });

          if (transformedContent !== originalContent) {
            processedCount++;
            this.log(`用户消息 ${message.id} 已应用输入模板`);

            return {
              ...message,
              content: transformedContent,
            };
          }

          return message;
        } catch (error) {
          errorCount++;
          this.log.extend('error')(`处理用户消息 ${message.id} 输入模板时出错: ${error}`);
          return message;
        }
      });

      // 更新元数据
      clonedContext.metadata.inputTemplateApplied = processedCount;
      clonedContext.metadata.inputTemplateErrors = errorCount;
      clonedContext.metadata.inputTemplate = this.inputTemplate;

      this.log(`输入模板处理完成，成功处理 ${processedCount} 条用户消息，错误 ${errorCount} 条`);
    } catch (error) {
      this.log.extend('error')(`编译输入模板时出错: ${error}`);
      // 模板编译错误时，返回原始上下文
      clonedContext.metadata.inputTemplateErrors = 1;
      clonedContext.metadata.inputTemplateError = String(error);
    }

    return this.markAsExecuted(clonedContext);
  }

  // 简化：不再暴露 set/get/预览/示例等方法，模板仅通过构造函数传入
}
