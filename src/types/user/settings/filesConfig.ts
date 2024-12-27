export interface FilesConfigItem {
  model: string;
  provider: string;
}
export interface FilesConfig {
  embedding_model: FilesConfigItem;
  query_model: string;
  reranker_model: FilesConfigItem;
}
