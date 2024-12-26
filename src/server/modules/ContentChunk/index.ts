import { ChunkingLoader } from 'src/libs/langchain';
import { Strategy } from 'unstructured-client/sdk/models/shared';

import { NewChunkItem, NewUnstructuredChunkItem } from '@/database/schemas';
import { ChunkingStrategy, Unstructured } from '@/libs/unstructured';

export interface ChunkContentParams {
  content: Uint8Array;
  fileType: string;
  filename: string;
  mode?: 'fast' | 'hi-res';
}

interface ChunkResult {
  chunks: NewChunkItem[];
  unstructuredChunks?: NewUnstructuredChunkItem[];
}

export class ContentChunk {
  private unstructuredClient: Unstructured;
  private langchainClient: ChunkingLoader;

  constructor() {
    this.unstructuredClient = new Unstructured();
    this.langchainClient = new ChunkingLoader();
  }

  isUsingUnstructured(params: ChunkContentParams) {
    return params.fileType === 'application/pdf' && params.mode === 'hi-res';
  }

  async chunkContent(params: ChunkContentParams): Promise<ChunkResult> {
    if (this.isUsingUnstructured(params))
      return await this.chunkByUnstructured(params.filename, params.content);

    return await this.chunkByLangChain(params.filename, params.content);
  }

  private chunkByUnstructured = async (
    filename: string,
    content: Uint8Array,
  ): Promise<ChunkResult> => {
    const result = await this.unstructuredClient.partition({
      chunkingStrategy: ChunkingStrategy.ByPage,
      fileContent: content,
      filename,
      strategy: Strategy.Auto,
    });

    // after finish partition, we need to filter out some elements
    const documents = result.compositeElements
      .filter((e) => !new Set(['PageNumber', 'Footer']).has(e.type))
      .map((item, index): NewChunkItem => {
        const {
          text_as_html,
          page_number,
          page_name,
          image_mime_type,
          image_base64,
          parent_id,
          languages,
          coordinates,
        } = item.metadata;

        return {
          id: item.element_id,
          index,
          metadata: {
            coordinates,
            image_base64,
            image_mime_type,
            languages,
            page_name,
            page_number,
            parent_id,
            text_as_html,
          },
          text: item.text,
          type: item.type,
        };
      });

    const chunks = result.originElements
      .filter((e) => !new Set(['PageNumber', 'Footer']).has(e.type))
      .map((item, index): NewUnstructuredChunkItem => {
        const {
          text_as_html,
          page_number,
          page_name,
          image_mime_type,
          image_base64,
          parent_id,
          languages,
          coordinates,
        } = item.metadata;

        return {
          compositeId: item.compositeId,
          id: item.element_id,
          index,
          metadata: {
            coordinates,
            image_base64,
            image_mime_type,
            languages,
            page_name,
            page_number,
            text_as_html,
          },
          parentId: parent_id,
          text: item.text,
          type: item.type,
        };
      });

    return { chunks: documents, unstructuredChunks: chunks };
  };

  private chunkByLangChain = async (
    filename: string,
    content: Uint8Array,
  ): Promise<ChunkResult> => {
    const res = await this.langchainClient.partitionContent(filename, content);

    const documents = res.map((item, index) => ({
      id: item.id,
      index,
      metadata: item.metadata,
      text: item.pageContent,
      type: 'LangChainElement',
    }));

    return { chunks: documents };
  };
}
