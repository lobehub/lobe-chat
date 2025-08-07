import debug from 'debug';

import type {
  AgentState,
  ContextProcessor,
  PipelineContext,
  PipelineResult,
  ProcessorOptions,
} from './types';
import { PipelineError } from './types';

const log = debug('context-engine:ContextPipeline');

/**
 * 上下文管道 - 核心编排器，按顺序执行处理器
 */
export class ContextPipeline {
  private processors: ContextProcessor[] = [];
  private options: ProcessorOptions;

  constructor(processors: ContextProcessor[] = [], options: ProcessorOptions = {}) {
    this.processors = [...processors];
    this.options = {
      debug: false,
      logger: console.log,
      ...options,
    };
  }

  /**
   * 添加处理器到管道
   */
  addProcessor(processor: ContextProcessor): this {
    this.processors.push(processor);
    return this;
  }

  /**
   * 移除处理器
   */
  removeProcessor(name: string): this {
    this.processors = this.processors.filter((p) => p.name !== name);
    return this;
  }

  /**
   * 获取处理器列表
   */
  getProcessors(): ContextProcessor[] {
    return [...this.processors];
  }

  /**
   * 清空所有处理器
   */
  clear(): this {
    this.processors = [];
    return this;
  }

  /**
   * 执行管道处理
   */
  async process(input: {
    initialState: AgentState;
    maxTokens: number;
    messages?: Array<any>;
    metadata?: Record<string, any>;
    model: string;
  }): Promise<PipelineResult> {
    const startTime = Date.now();
    const processorDurations: Record<string, number> = {};

    // 创建初始管道上下文
    let context: PipelineContext = {
      initialState: input.initialState,
      isAborted: false,
      messages: Array.isArray(input.messages) ? [...input.messages] : [],
      metadata: {
        maxTokens: input.maxTokens,
        model: input.model,
        ...input.metadata,
      },
    };

    log('Starting pipeline processing');
    log('Number of processors:', this.processors.length);

    let processedCount = 0;

    try {
      // 依次执行每个处理器
      for (const processor of this.processors) {
        if (context.isAborted) {
          log('Pipeline aborted before processor', processor.name, 'reason:', context.abortReason);
          break;
        }

        const processorStartTime = Date.now();
        log('Executing processor:', processor.name);

        try {
          context = await processor.process(context);
          processedCount++;

          const duration = Date.now() - processorStartTime;
          processorDurations[processor.name] = duration;

          log('Processor', processor.name, 'completed in', duration + 'ms');

          if (context.isAborted) {
            log('Pipeline aborted by processor', processor.name, 'reason:', context.abortReason);
            break;
          }
        } catch (error) {
          const duration = Date.now() - processorStartTime;
          processorDurations[processor.name] = duration;

          log('Processor', processor.name, 'execution failed:', error);
          throw new PipelineError(
            `处理器 [${processor.name}] 执行失败`,
            processor.name,
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      }

      const totalDuration = Date.now() - startTime;
      log('Pipeline processing completed in', totalDuration + 'ms');

      return {
        abortReason: context.abortReason,
        isAborted: context.isAborted,
        messages: context.messages,
        metadata: context.metadata,
        stats: {
          processedCount,
          processorDurations,
          totalDuration,
        },
      };
    } catch (error) {
      log('Pipeline processing failed:', error);

      if (error instanceof PipelineError) {
        throw error;
      }

      throw new PipelineError(
        '管道处理过程中发生未知错误',
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * 获取管道统计信息
   */
  getStats() {
    return {
      processorCount: this.processors.length,
      processorNames: this.processors.map((p) => p.name),
    };
  }

  /**
   * 克隆管道（深拷贝处理器列表）
   */
  clone(): ContextPipeline {
    return new ContextPipeline([...this.processors], { ...this.options });
  }

  /**
   * 验证管道配置
   */
  validate(): { errors: string[]; valid: boolean } {
    const errors: string[] = [];

    // 检查处理器名称重复
    const names = this.processors.map((p) => p.name);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      errors.push(`发现重复的处理器名称: ${duplicates.join(', ')}`);
    }

    // 检查处理器是否为空
    if (this.processors.length === 0) {
      errors.push('管道中没有处理器');
    }

    // 检查处理器是否实现了必要的方法
    this.processors.forEach((processor) => {
      if (!processor.name) {
        errors.push('处理器缺少名称');
      }
      if (typeof processor.process !== 'function') {
        errors.push(`处理器 [${processor.name}] 缺少 process 方法`);
      }
    });

    return {
      errors,
      valid: errors.length === 0,
    };
  }
}
