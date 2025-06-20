// src/store/global/slices/settings/initialState.ts
import { KnowledgeBaseSettings } from '@/types/user/settings';

// Define the structure of the settings part of the global state
export interface SettingsState {
  // General application settings
  language: string;
  theme: 'light' | 'dark' | 'auto';
  // ... other general settings

  // Knowledge Base specific settings
  knowledgeBaseSettings?: KnowledgeBaseSettings;
  indexedDocuments: Array<{ documentId: string; fileName?: string; firstChunkTextHint?: string; totalChunks: number }>; // Added for listing documents

  // Potentially other domain-specific settings
  // e.g., modelProviderSettings, syncSettings, etc.
}

// Define the initial state for settings
export const initialSettingsState: SettingsState = {
  language: 'en', // Default language
  theme: 'auto',  // Default theme
  knowledgeBaseSettings: {
    useLocalKnowledgeBase: false, // Default for our new feature
  },
  indexedDocuments: [], // Initialize as empty array
  // Initialize other settings fields as needed
};

// It's also common to have a broader GlobalSettingsState if the slice manages more than just `SettingsState`
// For instance, if it also includes loading states or error states for settings operations.
// For now, we'll assume GlobalSettingsState is equivalent to SettingsState for simplicity in this slice.
export type GlobalSettingsState = SettingsState;
