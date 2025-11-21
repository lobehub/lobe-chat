import { ChatSemanticSearchChunk, FileSearchResult } from '@lobechat/types';


export interface SearchKnowledgeBaseArgs {
  query: string;
  topK?: number;
}
export interface SearchKnowledgeBaseState {
  chunks: ChatSemanticSearchChunk[];
  fileResults: FileSearchResult[];
  totalResults: number;
}

export interface ReadKnowledgeState {
  fileIds: string[];
  filesRead: number;
}
