import debug from 'debug';

import { BaseProcessor } from '../base/BaseProcessor';
import type { ModelCapabilities, PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:processor:ModelCapabilityValidator');

/**
 * 模型能力验证器
 * 负责验证当前模型是否支持消息中使用的功能
 */
export class ModelCapabilityValidator extends BaseProcessor {
  readonly name = 'ModelCapabilityValidator';

  constructor(
    private modelCapabilities: ModelCapabilities,
    private options: { abortOnUnsupported?: boolean; autoFix?: boolean } = {},
    processorOptions: ProcessorOptions = {},
  ) {
    super(processorOptions);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    const validationResult = this.validateModelCapabilities(clonedContext);

    // If unsupported features are found
    if (validationResult.issues.length > 0) {
      log('Found', validationResult.issues.length, 'model capability issues');

      validationResult.issues.forEach((issue) => {
        log.extend('warn')(`- ${issue}`);
      });

      // Decide whether to abort or auto-fix based on configuration
      if (this.options.abortOnUnsupported && !this.options.autoFix) {
        return this.abort(
          clonedContext,
          `Model does not support required features: ${validationResult.issues.join(', ')}`,
        );
      }

      if (this.options.autoFix) {
        this.applyAutoFixes(clonedContext, validationResult);
      }
    }

    // 更新元数据
    clonedContext.metadata.modelCapabilityValidation = {
      validated: true,
      issues: validationResult.issues,
      autoFixed: this.options.autoFix ? validationResult.issues.length : 0,
      capabilities: this.modelCapabilities,
    };

    log('模型能力验证完成');

    return this.markAsExecuted(clonedContext);
  }

  /**
   * 验证模型能力
   */
  private validateModelCapabilities(context: PipelineContext): {
    valid: boolean;
    issues: string[];
    details: {
      hasVisionContent: boolean;
      hasFunctionCalls: boolean;
      hasReasoningContent: boolean;
      hasSearchContent: boolean;
    };
  } {
    const issues: string[] = [];
    const details = {
      hasVisionContent: false,
      hasFunctionCalls: false,
      hasReasoningContent: false,
      hasSearchContent: false,
    };

    // 检查消息中的各种功能使用
    context.messages.forEach((message) => {
      // 检查视觉功能
      if (this.hasVisionContent(message)) {
        details.hasVisionContent = true;
        if (!this.modelCapabilities.supportsVision) {
          issues.push(`消息 ${message.id} 包含图像内容，但模型不支持视觉功能`);
        }
      }

      // 检查函数调用
      if (this.hasFunctionCalls(message)) {
        details.hasFunctionCalls = true;
        if (!this.modelCapabilities.supportsFunctionCall) {
          issues.push(`消息 ${message.id} 包含函数调用，但模型不支持函数调用功能`);
        }
      }

      // 检查推理内容
      if (this.hasReasoningContent(message)) {
        details.hasReasoningContent = true;
        if (!this.modelCapabilities.supportsReasoning) {
          issues.push(`消息 ${message.id} 包含推理内容，但模型不支持推理功能`);
        }
      }
    });

    // 检查搜索功能
    if (context.metadata.searchContext?.enabled) {
      details.hasSearchContent = true;
      if (!this.modelCapabilities.supportsSearch) {
        issues.push('启用了搜索功能，但模型不支持搜索');
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      details,
    };
  }

  /**
   * 应用自动修复
   */
  private applyAutoFixes(context: PipelineContext, validationResult: any): void {
    log('开始应用自动修复');

    context.messages = context.messages.map((message) => {
      let fixedMessage = { ...message };

      // 修复视觉内容
      if (this.hasVisionContent(message) && !this.modelCapabilities.supportsVision) {
        fixedMessage = this.removeVisionContent(fixedMessage);
        log(`已从消息 ${message.id} 中移除视觉内容`);
      }

      // 修复函数调用
      if (this.hasFunctionCalls(message) && !this.modelCapabilities.supportsFunctionCall) {
        fixedMessage = this.removeFunctionCalls(fixedMessage);
        log(`已从消息 ${message.id} 中移除函数调用`);
      }

      // 修复推理内容
      if (this.hasReasoningContent(message) && !this.modelCapabilities.supportsReasoning) {
        fixedMessage = this.removeReasoningContent(fixedMessage);
        log(`已从消息 ${message.id} 中移除推理内容`);
      }

      return fixedMessage;
    });

    // 修复搜索功能
    if (context.metadata.searchContext?.enabled && !this.modelCapabilities.supportsSearch) {
      context.metadata.searchContext.enabled = false;
      log('已禁用搜索功能');
    }
  }

  /**
   * 检查是否有视觉内容
   */
  private hasVisionContent(message: any): boolean {
    return (
      (message.imageList && message.imageList.length > 0) ||
      (Array.isArray(message.content) &&
        message.content.some((part: any) => part.type === 'image_url'))
    );
  }

  /**
   * 检查是否有函数调用
   */
  private hasFunctionCalls(message: any): boolean {
    return (
      (message.tools && message.tools.length > 0) ||
      (message.tool_calls && message.tool_calls.length > 0) ||
      message.role === 'tool'
    );
  }

  /**
   * 检查是否有推理内容
   */
  private hasReasoningContent(message: any): boolean {
    return message.reasoning && message.reasoning.content;
  }

  /**
   * 移除视觉内容
   */
  private removeVisionContent(message: any): any {
    const fixed = { ...message };

    // 移除图像列表
    delete fixed.imageList;

    // 如果内容是数组，移除图像部分
    if (Array.isArray(fixed.content)) {
      fixed.content = fixed.content.filter((part: any) => part.type !== 'image_url');

      // 如果只剩下一个文本部分，简化为字符串
      if (fixed.content.length === 1 && fixed.content[0].type === 'text') {
        fixed.content = fixed.content[0].text;
      }
    }

    return fixed;
  }

  /**
   * 移除函数调用
   */
  private removeFunctionCalls(message: any): any {
    const fixed = { ...message };

    // 移除工具相关字段
    delete fixed.tools;
    delete fixed.tool_calls;

    // 如果是工具消息，转换为用户消息
    if (fixed.role === 'tool') {
      fixed.role = 'user';
      delete fixed.tool_call_id;
      delete fixed.plugin;
    }

    return fixed;
  }

  /**
   * 移除推理内容
   */
  private removeReasoningContent(message: any): any {
    const fixed = { ...message };

    // 移除推理字段
    delete fixed.reasoning;

    // 如果内容是数组且包含推理部分，移除推理部分
    if (Array.isArray(fixed.content)) {
      fixed.content = fixed.content.filter((part: any) => part.type !== 'thinking');

      // 如果只剩下一个文本部分，简化为字符串
      if (fixed.content.length === 1 && fixed.content[0].type === 'text') {
        fixed.content = fixed.content[0].text;
      }
    }

    return fixed;
  }

  // 简化：移除 set/get 配置接口，仅通过构造函数传入
}
