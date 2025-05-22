// apps/desktop/src/types/settings.ts

/**
 * Settings related to the Knowledge Base functionality.
 */
export interface KnowledgeBaseSettings {
  /**
   * Determines whether to use the local, client-side RAG (Retrieval Augmented Generation)
   * for knowledge base queries.
   *
   * @default false
   */
  useLocalKnowledgeBase?: boolean;
  // Add other knowledge base related settings here in the future
  // e.g., selected local embedding model, chunking strategy options, etc.
}

// Example of other settings that might exist, to give context
export interface GeneralSettings {
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * Represents the overall structure of user-configurable settings
 * that might be stored. This is a placeholder and should be adapted
 * to the actual full settings structure of the application.
 */
export interface UserSettings {
  general?: GeneralSettings;
  knowledgeBase?: KnowledgeBaseSettings;
  // ... other categories of settings
}
