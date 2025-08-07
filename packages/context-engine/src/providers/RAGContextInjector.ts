import debug from 'debug';

import { BaseProvider } from '../base/BaseProvider';
import type { PipelineContext, ProcessorOptions, RAGContext, RetrievalChunk } from '../types';

/**
 * RAG 上下文注入器配置
 */
export interface RAGContextConfig {
  /** 检索的文档块 */
  chunks: RetrievalChunk[];
  /** 重写后的查询 */
  rewriteQuery?: string;
  /** 查询ID */
  queryId?: string;
  /** 最大上下文长度 */
  maxContextLength?: number;
  /** 最小相似度阈值 */
  minSimilarity?: number;
  /** 是否启用相似度排序 */
  sortBySimilarity?: boolean;
}

/**
 * RAG 上下文注入器
 * 负责将检索到的相关文档内容注入到用户查询中
 */
export class RAGContextInjector extends BaseProvider {
  readonly name = 'RAGContextInjector';

  private readonly log = debug('context-engine:provider:RAGContextInjector');

  constructor(
    private config: RAGContextConfig,
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    // 验证配置
    if (!this.config.chunks || this.config.chunks.length === 0) {
      this.log('没有检索块需要注入');
      return this.markAsExecuted(clonedContext);
    }

    // 处理和过滤检索块
    const processedChunks = this.processRetrievalChunks(this.config.chunks);

    if (processedChunks.length === 0) {
      this.log('没有符合条件的检索块');
      return this.markAsExecuted(clonedContext);
    }

    // 找到最后一条用户消息
    const lastUserMessage = this.findLastUserMessage(clonedContext.messages);

    if (!lastUserMessage) {
      this.log.extend('warn')('未找到用户消息，跳过 RAG 上下文注入');
      return this.markAsExecuted(clonedContext);
    }

    // 构建 RAG 上下文
    const ragContext = this.buildRAGContext(processedChunks);

    // 将 RAG 上下文注入到用户消息中
    const updatedContent = this.injectRAGContext(lastUserMessage.content, ragContext);
    lastUserMessage.content = updatedContent;

    // 更新元数据
    clonedContext.metadata.ragContext = {
      chunksCount: processedChunks.length,
      totalContextLength: ragContext.length,
      queryId: this.config.queryId,
      rewriteQuery: this.config.rewriteQuery,
      minSimilarity: Math.min(...processedChunks.map((c) => c.similarity)),
      maxSimilarity: Math.max(...processedChunks.map((c) => c.similarity)),
      avgSimilarity:
        processedChunks.reduce((sum, c) => sum + c.similarity, 0) / processedChunks.length,
    };

    this.log(`RAG 上下文注入完成，使用了 ${processedChunks.length} 个检索块`);

    return this.markAsExecuted(clonedContext);
  }

  /**
   * 处理和过滤检索块
   */
  private processRetrievalChunks(chunks: RetrievalChunk[]): RetrievalChunk[] {
    let processedChunks = [...chunks];

    // 过滤相似度低的块
    if (this.config.minSimilarity !== undefined) {
      processedChunks = processedChunks.filter(
        (chunk) => chunk.similarity >= this.config.minSimilarity!,
      );
      this.log(`相似度过滤后剩余 ${processedChunks.length} 个检索块`);
    }

    // 按相似度排序
    if (this.config.sortBySimilarity !== false) {
      processedChunks.sort((a, b) => b.similarity - a.similarity);
      this.log('检索块已按相似度降序排列');
    }

    // 限制上下文长度
    if (this.config.maxContextLength) {
      processedChunks = this.truncateByLength(processedChunks, this.config.maxContextLength);
      this.log(`长度限制后剩余 ${processedChunks.length} 个检索块`);
    }

    return processedChunks;
  }

  /**
   * 按长度截断检索块
   */
  private truncateByLength(chunks: RetrievalChunk[], maxLength: number): RetrievalChunk[] {
    const result: RetrievalChunk[] = [];
    let totalLength = 0;

    for (const chunk of chunks) {
      const chunkLength = chunk.content.length;

      if (totalLength + chunkLength <= maxLength) {
        result.push(chunk);
        totalLength += chunkLength;
      } else {
        // 尝试截断当前块
        const remainingLength = maxLength - totalLength;
        if (remainingLength > 100) {
          // 至少保留100字符
          result.push({
            ...chunk,
            content: chunk.content.substring(0, remainingLength) + '...',
          });
        }
        break;
      }
    }

    return result;
  }

  /**
   * 找到最后一条用户消息
   */
  private findLastUserMessage(messages: any[]) {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i];
      }
    }
    return null;
  }

  /**
   * 构建 RAG 上下文字符串
   */
  private buildRAGContext(chunks: RetrievalChunk[]): string {
    const contextParts = ['以下是相关的背景信息，请基于这些信息回答用户的问题：', ''];

    chunks.forEach((chunk, index) => {
      contextParts.push(
        `[参考资料 ${index + 1}] (相似度: ${(chunk.similarity * 100).toFixed(1)}%)`,
        chunk.content.trim(),
        '',
      );
    });

    if (this.config.rewriteQuery) {
      contextParts.push(
        '用户查询经过重写优化：',
        `原始查询 -> 优化查询: ${this.config.rewriteQuery}`,
        '',
      );
    }

    contextParts.push('请基于以上参考资料回答用户的问题。如果参考资料中没有相关信息，请明确说明。');

    return contextParts.join('\n');
  }

  /**
   * 将 RAG 上下文注入到用户消息中
   */
  private injectRAGContext(originalContent: string, ragContext: string): string {
    return [originalContent, '', ragContext].join('\n').trim();
  }

  // 简化：不再提供 set/get/统计/预览方法，配置仅通过构造函数传入
}
