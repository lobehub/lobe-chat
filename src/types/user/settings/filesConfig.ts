export interface FilesConfigItem {
  model: string;
  provider: string;
}
export interface FilesConfig {
  embeddingModel: FilesConfigItem;
  queryModel: string;
  rerankerModel: FilesConfigItem;
}
