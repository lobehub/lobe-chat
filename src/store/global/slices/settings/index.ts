// src/store/global/slices/settings/index.ts
import { StateCreator } from 'zustand';

import { GlobalStore } from '@/store/global'; // Assuming GlobalStore is the combined store type
import {
  KnowledgeBaseSettingsActions,
  knowledgeBaseSettingsActionsSlice,
} from './actions/knowledgeBase';
import { SettingsState, initialSettingsState } from './initialState';
import { selectKnowledgeBaseSettings, selectUseLocalKnowledgeBase } from './selectors/knowledgeBase';

// Define the interface for the complete SettingsSlice, including state and actions
export interface SettingsSlice extends SettingsState, KnowledgeBaseSettingsActions {
  resetSettings: () => void;
  // Note: KnowledgeBaseSettingsActions are already included via the spread in createSettingsSlice
}

// Create the main settings slice
export const createSettingsSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  SettingsSlice
> = (set, get, api) => ({
  ...initialSettingsState,

  // Integrate actions from other parts of the slice, including knowledge base actions
  ...knowledgeBaseSettingsActionsSlice(set, get, api),

  resetSettings: () => {
    set(
      (state) => ({
        ...state, // Preserve other top-level store parts if GlobalStore is more than just SettingsSlice
        settings: { // Reset only the settings part of the store
          ...initialSettingsState,
        },
      }),
      false,
      'resetSettings',
    );
    // Persist the reset state to the main process for relevant settings
    const { knowledgeBaseSettings } = initialSettingsState;
    if (knowledgeBaseSettings) {
      // Assuming persistKnowledgeBaseSettingsToMain is part of knowledgeBaseSettingsActionsSlice
      get().persistKnowledgeBaseSettingsToMain(knowledgeBaseSettings);
    }
    // Also ensure indexedDocuments are cleared on reset if managed here
    get().setIndexedDocuments(initialSettingsState.indexedDocuments);

    // Add persistence for other settings groups if necessary
  },
});

// Re-export selectors for easy access from components
// Selectors are now defined in their respective files and imported directly by components
// or re-exported from a central selectors file if preferred.
// For this structure, we assume components will import from './selectors/knowledgeBase'
export * from './selectors/knowledgeBase'; // Re-exporting selectors for convenience
