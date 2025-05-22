// src/types/user/settings.ts

/**
 * Settings related to the Knowledge Base functionality.
 * This type is intended to be used by both main and renderer processes.
 */
export interface KnowledgeBaseSettings {
  /**
   * Determines whether to use the local, client-side RAG (Retrieval Augmented Generation)
   * for knowledge base queries.
   *
   * When true, RAG operations (like semantic search) will be attempted locally
   * using the embedded vector database and models in the Electron app.
   * When false, RAG operations will be routed to the remote server if configured.
   *
   * @default false
   */
  useLocalKnowledgeBase?: boolean;

  // Future settings could include:
  // embeddingModel?: string; // Identifier for the local embedding model to use
  // vectorDbPath?: string; // Path to the local vector database (if user-configurable)
  // defaultChunkSize?: number;
}

/**
 * Represents the overall structure of user-configurable settings.
 * This should align with how settings are stored and managed globally.
 */
export interface UserSettings {
  // ... other general settings like language, theme, etc.
  // For example:
  // general?: {
  //   language?: string;
  //   theme?: 'light' | 'dark' | 'auto';
  // };

  /**
   * Knowledge Base specific settings.
   */
  knowledgeBase?: KnowledgeBaseSettings;

  // ... other categories of settings
}

// This is a more specific settings structure that might be used in the Zustand store
// It should be compatible with ElectronMainStore and how settings are fetched/saved.
export interface SettingsState {
  // ... other settings fields
  knowledgeBaseSettings?: KnowledgeBaseSettings;
}
