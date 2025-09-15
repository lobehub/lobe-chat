import type { ContextProcessor, PipelineContext, ProcessorOptions } from '../types';
import { ProcessorError } from '../types';

/**
 * 基础处理器抽象类
 * 提供通用的处理器功能和错误处理
 */
export abstract class BaseProcessor implements ContextProcessor {
  abstract readonly name: string;

  // 为了兼容现有子类构造函数签名，保留参数但不做任何处理
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_options: ProcessorOptions = {}) {}

  /**
   * 核心处理方法 - 子类需要实现
   */
  protected abstract doProcess(context: PipelineContext): Promise<PipelineContext>;

  /**
   * 公共处理入口，包含错误处理和日志
   */
  async process(context: PipelineContext): Promise<PipelineContext> {
    try {
      this.validateInput(context);
      const result = await this.doProcess(context);
      this.validateOutput(result);
      return result;
    } catch (error) {
      throw new ProcessorError(
        this.name,
        `处理失败: ${error}`,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * 验证输入上下文
   */
  protected validateInput(context: PipelineContext): void {
    if (!context || !Array.isArray(context.messages)) {
      throw new Error('无效的上下文');
    }
  }

  /**
   * 验证输出上下文
   */
  protected validateOutput(context: PipelineContext): void {
    if (!context || !Array.isArray(context.messages)) {
      throw new Error('无效的输出上下文');
    }
  }

  /**
   * 安全地克隆上下文
   */
  protected cloneContext(context: PipelineContext): PipelineContext {
    return {
      ...context,
      messages: [...context.messages],
      metadata: { ...context.metadata },
    };
  }

  /**
   * 中止管道处理
   */
  protected abort(context: PipelineContext, reason: string): PipelineContext {
    return {
      ...context,
      abortReason: reason,
      isAborted: true,
    };
  }

  /**
   * 检查消息是否为空
   */
  protected isEmptyMessage(message: string | undefined | null): boolean {
    return !message || message.trim().length === 0;
  }

  protected markAsExecuted(context: PipelineContext): PipelineContext {
    return context;
  }
}
