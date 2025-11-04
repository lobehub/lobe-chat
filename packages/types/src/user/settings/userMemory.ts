export interface UserMemoryConfigItem {
  model: string;
  provider: string;
}

export interface UserMemoryConfig {
  embeddingModel: UserMemoryConfigItem;
}
