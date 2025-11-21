import { formatSearchResults } from '@lobechat/prompts';
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
      const { chunks, fileResults } = await ragService.semanticSearchForChat({
        fileIds: options?.fileIds,
        knowledgeIds: options?.knowledgeBaseIds,
        query,
        topK,
      });

      if (chunks.length === 0) {
        const state: SearchKnowledgeBaseState = { chunks: [], fileResults: [], totalResults: 0 };

        return {
          content: this.formatNoSearchResults(query),
          state,
          success: true,
        };
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
    options?: {
      signal?: AbortSignal;
    },
  ): Promise<BuiltinServerRuntimeOutput> {
    try {
      const { fileIds } = args;

      if (!fileIds || fileIds.length === 0) {
        return {
          content: 'Error: No file IDs provided',
          success: false,
        };
      }

      // TODO: Implement actual file content retrieval
      // For now, return a placeholder
      const fileContents = await this.fetchFileContents(fileIds);

      const formattedContent = this.formatFileContents(fileContents);

      const state: ReadKnowledgeState = {
        fileIds,
        filesRead: fileContents.length,
      };

      return {
        content: formattedContent,
        state,
        success: true,
      };
    } catch (e) {
      return {
        content: `Error reading knowledge: ${(e as Error).message}`,
        error: e,
        success: false,
      };
    }
  }

  /**
   * Format message when no search results found
   */
  private formatNoSearchResults(query: string): string {
    return `# Knowledge Base Search Results

**Search Query:** ${query}

No relevant files found in the knowledge base for this query.

**Suggestions:**
- Try rephrasing your question with different keywords
- Check if the information exists in the uploaded documents
- Ask the user to provide more context or upload relevant documents`;
  }

  /**
   * Fetch full content of files (placeholder implementation)
   */
  private async fetchFileContents(
    fileIds: string[],
  ): Promise<Array<{ content: string; fileId: string; fileName: string }>> {
    // TODO: Implement actual file content retrieval from database
    // This should fetch the full parsed content of each file
    return fileIds.map((fileId) => ({
      content: `[Full content of file ${fileId} will be loaded here]`,
      fileId,
      fileName: `File ${fileId}`,
    }));
  }

  /**
   * Format file contents for AI consumption
   */
  private formatFileContents(
    fileContents: Array<{ content: string; fileId: string; fileName: string }>,
  ): string {
    const sections: string[] = [
      `# Knowledge Base - File Contents`,
      ``,
      `**Files Read:** ${fileContents.length}`,
      ``,
    ];

    fileContents.forEach((file, index) => {
      sections.push(
        `## File ${index + 1}: ${file.fileName}`,
        ``,
        `**File ID:** \`${file.fileId}\``,
        ``,
        `### Content`,
        ``,
        file.content,
        ``,
        `---`,
        ``,
      );
    });

    sections.push(
      `**Note:** Use the information above to answer the user's question. Always cite the source files.`,
    );

    return sections.join('\n');
  }
}
