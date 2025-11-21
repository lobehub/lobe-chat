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

export interface FileContentDetail {
  error?: string;
  fileId: string;
  filename: string;
  preview?: string;
  totalCharCount?: number;
  totalLineCount?: number;
}

export interface ReadKnowledgeState {
  files: FileContentDetail[];
}
