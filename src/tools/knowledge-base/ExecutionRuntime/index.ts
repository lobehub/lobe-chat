import { BuiltinServerRuntimeOutput, ChatSemanticSearchChunk } from '@lobechat/types';

import { ragService } from '@/services/rag';

export interface SearchKnowledgeBaseArgs {
  query: string;
  topK?: number;
}

export interface ReadKnowledgeArgs {
  fileIds: string[];
}

interface FileSearchResult {
  fileId: string;
  fileName: string;
  relevanceScore: number;
  topChunks: Array<{
    id: string;
    similarity: number;
    text: string;
  }>;
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
      const { query, topK = 5 } = args;

      // Call the existing RAG service
      const { chunks, queryId } = await ragService.semanticSearchForChat({
        fileIds: options?.fileIds || [],
        knowledgeIds: options?.knowledgeBaseIds || [],
        messageId: options?.messageId || 'temp-' + Date.now(),
        rewriteQuery: query,
        userQuery: query,
      });

      if (chunks.length === 0) {
        return {
          content: this.formatNoSearchResults(query),
          state: {
            chunks: [],
            queryId,
            totalResults: 0,
          },
          success: true,
        };
      }

      // Group chunks by file and calculate relevance scores
      const fileResults = this.groupAndRankFiles(chunks, topK);

      // Format search results for AI
      const formattedContent = this.formatSearchResults(fileResults, query);

      return {
        content: formattedContent,
        state: {
          chunks,
          fileResults,
          queryId,
          totalResults: chunks.length,
        },
        success: true,
      };
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

      return {
        content: formattedContent,
        state: {
          fileIds,
          filesRead: fileContents.length,
        },
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
   * Group chunks by file and calculate relevance scores
   */
  private groupAndRankFiles(chunks: ChatSemanticSearchChunk[], topK: number): FileSearchResult[] {
    const fileMap = new Map<string, FileSearchResult>();

    // Group chunks by file
    for (const chunk of chunks) {
      const fileId = chunk.fileId || 'unknown';
      const fileName = chunk.fileName || `File ${fileId}`;

      if (!fileMap.has(fileId)) {
        fileMap.set(fileId, {
          fileId,
          fileName,
          relevanceScore: 0,
          topChunks: [],
        });
      }

      const fileResult = fileMap.get(fileId)!;
      fileResult.topChunks.push({
        id: chunk.id,
        similarity: chunk.similarity,
        text: chunk.text || '',
      });
    }

    // Calculate relevance score for each file (average of top 3 chunks)
    for (const fileResult of fileMap.values()) {
      fileResult.topChunks.sort((a, b) => b.similarity - a.similarity);
      const top3 = fileResult.topChunks.slice(0, 3);
      fileResult.relevanceScore =
        top3.reduce((sum, chunk) => sum + chunk.similarity, 0) / top3.length;
      // Keep only top chunks per file
      fileResult.topChunks = fileResult.topChunks.slice(0, 3);
    }

    // Sort files by relevance score and return top K
    return Array.from(fileMap.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, topK);
  }

  /**
   * Format search results for AI consumption
   */
  private formatSearchResults(fileResults: FileSearchResult[], query: string): string {
    const sections: string[] = [
      `# Knowledge Base Search Results`,
      ``,
      `**Search Query:** ${query}`,
      `**Files Found:** ${fileResults.length}`,
      ``,
      `## Relevant Files`,
      ``,
    ];

    fileResults.forEach((file, index) => {
      sections.push(`### ${index + 1}. ${file.fileName}`, ``, `- **File ID:** \`${file.fileId}\``);
      sections.push(`- **Relevance Score:** ${(file.relevanceScore * 100).toFixed(1)}%`, ``, `**Top Relevant Excerpts:**`, ``);

      file.topChunks.forEach((chunk, chunkIndex) => {
        sections.push(
          `${chunkIndex + 1}. (${(chunk.similarity * 100).toFixed(1)}%) ${this.truncateText(chunk.text, 200)}`, ``
        );
      });

      sections.push(`---`, ``);
    });

    sections.push(
      `**Next Steps:** Use the \`readKnowledge\` tool with the file IDs above to get complete content from relevant files.`,
    );

    return sections.join('\n');
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
  ): Promise<Array<{ content: string, fileId: string; fileName: string; }>> {
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
    fileContents: Array<{ content: string, fileId: string; fileName: string; }>,
  ): string {
    const sections: string[] = [
      `# Knowledge Base - File Contents`,
      ``,
      `**Files Read:** ${fileContents.length}`,
      ``,
    ];

    fileContents.forEach((file, index) => {
      sections.push(`## File ${index + 1}: ${file.fileName}`, ``, `**File ID:** \`${file.fileId}\``, ``, `### Content`, ``, file.content, ``, `---`, ``);
    });

    sections.push(
      `**Note:** Use the information above to answer the user's question. Always cite the source files.`,
    );

    return sections.join('\n');
  }

  /**
   * Truncate text to specified length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }
}
