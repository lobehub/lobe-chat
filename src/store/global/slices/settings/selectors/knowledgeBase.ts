// src/store/global/slices/settings/selectors/knowledgeBase.ts
import { GlobalSettingsState } from '@/store/global/slices/settings/initialState';
import { KnowledgeBaseSettings } from '@/types/user/settings'; // Assuming this path will be created/used

// Selector to get the entire knowledgeBaseSettings object
export const selectKnowledgeBaseSettings = (s: GlobalSettingsState): KnowledgeBaseSettings | undefined => {
  // The actual state might be nested under `s.settings.knowledgeBase` or similar
  // Adjust based on the final structure of GlobalSettingsState / SettingsState
  // For now, let's assume settings are at the root of the slice passed.
  // Or, if settings are fetched and stored flat:
  return s.knowledgeBaseSettings;
};

// Selector to directly get the useLocalKnowledgeBase boolean
export const selectUseLocalKnowledgeBase = (s: GlobalSettingsState): boolean => {
  return s.knowledgeBaseSettings?.useLocalKnowledgeBase ?? false; // Default to false if not set
};

// Selector for indexed documents
export const selectIndexedDocuments = (s: GlobalSettingsState): Array<{ documentId: string; fileName?: string; firstChunkTextHint?: string; totalChunks: number }> => {
  return s.indexedDocuments || []; // Default to empty array
};

// Example: Selector for another hypothetical knowledge base setting
// export const selectLocalEmbeddingModel = (s: GlobalSettingsState): string | undefined => {
//   return s.knowledgeBaseSettings?.localEmbeddingModel;
// };
