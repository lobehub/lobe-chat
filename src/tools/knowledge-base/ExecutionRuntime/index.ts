import { formatSearchResults, promptFileContents, promptNoSearchResults } from '@lobechat/prompts';
import { BuiltinServerRuntimeOutput } from '@lobechat/types';

import { ragService } from '@/services/rag';

import { ReadKnowledgeState, SearchKnowledgeBaseArgs, SearchKnowledgeBaseState } from '../type';

export interface ReadKnowledgeArgs {
  fileIds: string[];
}

export class KnowledgeBaseExecutionRuntime {
  /**
   * Search knowledge base and return file summaries with relevant chunks
   */
  async searchKnowledgeBase(
    args: SearchKnowledgeBaseArgs,
    options?: {
      fileIds?: string[];
      knowledgeBaseIds?: string[];
      messageId?: string;
      signal?: AbortSignal;
    },
  ): Promise<BuiltinServerRuntimeOutput> {
    try {
      const { query, topK = 20 } = args;

      // Call the existing RAG service
      const { chunks, fileResults } = await ragService.semanticSearchForChat(
        { fileIds: options?.fileIds, knowledgeIds: options?.knowledgeBaseIds, query, topK },
        options?.signal,
      );

      if (chunks.length === 0) {
        const state: SearchKnowledgeBaseState = { chunks: [], fileResults: [], totalResults: 0 };

        return { content: promptNoSearchResults(query), state, success: true };
      }

      // Format search results for AI
      const formattedContent = formatSearchResults(fileResults, query);

      const state: SearchKnowledgeBaseState = { chunks, fileResults, totalResults: chunks.length };

      return { content: formattedContent, state, success: true };
    } catch (e) {
      return {
        content: `Error searching knowledge base: ${(e as Error).message}`,
        error: e,
        success: false,
      };
    }
  }

  /**
   * Read full content of specific files from knowledge base
   */
  async readKnowledge(
    args: ReadKnowledgeArgs,
    options?: { signal?: AbortSignal },
  ): Promise<BuiltinServerRuntimeOutput> {
    try {
      const { fileIds } = args;

      if (!fileIds || fileIds.length === 0) {
        return {
          content: 'Error: No file IDs provided',
          success: false,
        };
      }

      const fileContents = await ragService.getFileContents(fileIds, options?.signal);

      const formattedContent = promptFileContents(fileContents);

      const state: ReadKnowledgeState = {
        files: fileContents.map((file) => ({
          error: file.error,
          fileId: file.fileId,
          filename: file.filename,
          preview: file.preview,
          totalCharCount: file.totalCharCount,
          totalLineCount: file.totalLineCount,
        })),
      };

      return { content: formattedContent, state, success: true };
    } catch (e) {
      return {
        content: `Error reading knowledge: ${(e as Error).message}`,
        error: e,
        success: false,
      };
    }
  }
}
