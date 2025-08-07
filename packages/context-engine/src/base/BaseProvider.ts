import type { PipelineContext } from '../types';
import { BaseProcessor } from './BaseProcessor';

/**
 * 极简 Provider：约束为“注入系统消息到开头”这一单一职责
 */
export abstract class BaseProvider extends BaseProcessor {
  // 子类可选择实现；默认不构建额外上下文
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async buildContext(_context: PipelineContext): Promise<string | null> {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected shouldInject(_context: PipelineContext): boolean {
    return true;
  }

  protected createSystemMessage(content: string): any {
    return { content, role: 'system' };
  }
}
