export enum AsyncTaskType {
  Chunking = 'chunk',
  Embedding = 'embedding',
}

export enum AsyncTaskStatus {
  Error = 'error',
  Pending = 'pending',
  Processing = 'processing',
  Success = 'success',
}

export enum AsyncTaskErrorType {
  SDKError = 'SDKError',
  ServerError = 'ServerError',
  Timeout = 'TaskTimeout',
}

export interface AsyncTaskError {
  body: string | { detail: string };
  name: string;
}

export interface FileParsingTask {
  chunkCount?: number | null;
  chunkingError?: AsyncTaskError | null;
  chunkingStatus?: AsyncTaskStatus | null;
  embeddingError?: AsyncTaskError | null;
  embeddingStatus?: AsyncTaskStatus | null;
  finishEmbedding?: boolean;
}
