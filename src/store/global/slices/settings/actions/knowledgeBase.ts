// src/store/global/slices/settings/actions/knowledgeBase.ts
import { produce } from 'immer';
import { StateCreator } from 'zustand';

import { GlobalStore } from '@/store/global';
import { KnowledgeBaseSettings } from '@/types/user/settings'; // Assuming this path will be created/used

// Define the interface for the actions
export interface KnowledgeBaseSettingsActions {
  // Action to set the entire knowledgeBaseSettings object
  setKnowledgeBaseSettings: (settings: KnowledgeBaseSettings) => void;
  // Action to update specific fields in knowledgeBaseSettings (partial update)
  updateKnowledgeBaseSettings: (settings: Partial<KnowledgeBaseSettings>) => void;
  // Action to toggle the useLocalKnowledgeBase flag specifically
  toggleUseLocalKnowledgeBase: (useLocal: boolean) => void;

  // Actions to interact with main process for persistence
  fetchKnowledgeBaseSettingsFromMain: () => Promise<void>;
  persistKnowledgeBaseSettingsToMain: (settings: KnowledgeBaseSettings) => Promise<void>;

  // Actions for managing indexed documents
  fetchIndexedDocuments: () => Promise<void>;
  removeDocumentById: (documentId: string) => Promise<void>;
  // Action to set indexed documents in store (internal or for direct update)
  setIndexedDocuments: (documents: Array<{ documentId: string; fileName?: string; firstChunkTextHint?: string; totalChunks: number }>) => void;
}

// Create the slice for knowledge base settings actions
export const knowledgeBaseSettingsActionsSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  KnowledgeBaseSettingsActions
> = (set, get) => ({
  setKnowledgeBaseSettings: (settings) => {
    set(
      produce((draft: GlobalStore) => {
        if (!draft.settings.knowledgeBaseSettings) {
          draft.settings.knowledgeBaseSettings = {};
        }
        draft.settings.knowledgeBaseSettings = settings;
      }),
      false,
      'setKnowledgeBaseSettings',
    );
  },
  updateKnowledgeBaseSettings: (settingsUpdate) => {
    set(
      produce((draft: GlobalStore) => {
        if (!draft.settings.knowledgeBaseSettings) {
          draft.settings.knowledgeBaseSettings = {};
        }
        draft.settings.knowledgeBaseSettings = {
          ...draft.settings.knowledgeBaseSettings,
          ...settingsUpdate,
        };
      }),
      false,
      'updateKnowledgeBaseSettings',
    );
    const currentSettings = get().settings.knowledgeBaseSettings;
    if (currentSettings) {
      get().persistKnowledgeBaseSettingsToMain(currentSettings);
    }
  },
  toggleUseLocalKnowledgeBase: (useLocal) => {
    set(
      produce((draft: GlobalStore) => {
        if (!draft.settings.knowledgeBaseSettings) {
          draft.settings.knowledgeBaseSettings = {};
        }
        draft.settings.knowledgeBaseSettings.useLocalKnowledgeBase = useLocal;
      }),
      false,
      'toggleUseLocalKnowledgeBase',
    );
    const currentSettings = get().settings.knowledgeBaseSettings;
    if (currentSettings) {
      get().persistKnowledgeBaseSettingsToMain(currentSettings);
    }
  },
  fetchKnowledgeBaseSettingsFromMain: async () => {
    try {
      const settings = await window.electron.ipcRenderer.invoke('getKnowledgeBaseSettings');
      if (settings) {
        get().setKnowledgeBaseSettings(settings);
        console.log('[KnowledgeBaseStore] Fetched KB settings from main:', settings);
      }
    } catch (error) {
      console.error('[KnowledgeBaseStore] Error fetching KB settings from main:', error);
    }
  },
  persistKnowledgeBaseSettingsToMain: async (settings) => {
    try {
      await window.electron.ipcRenderer.invoke('updateKnowledgeBaseSettings', settings);
      console.log('[KnowledgeBaseStore] Persisted KB settings to main:', settings);
    } catch (error) {
      console.error('[KnowledgeBaseStore] Error persisting KB settings to main:', error);
    }
  },

  // Indexed Documents Actions
  setIndexedDocuments: (documents) => {
    set(
      produce((draft: GlobalStore) => {
        draft.settings.indexedDocuments = documents;
      }),
      false,
      'setIndexedDocuments',
    );
  },
  fetchIndexedDocuments: async (): Promise<{ success: boolean; error?: string }> => {
    console.log('[KnowledgeBaseStore] Fetching indexed documents...');
    if (!window.electron || !window.electron.ipcRenderer) {
      const errorMsg = 'Electron IPC not available.';
      console.error(`[KnowledgeBaseStore] ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
    try {
      // Assuming handleListLocalRagDocuments returns { success: boolean, data?: any[], error?: string }
      const response = await window.electron.ipcRenderer.invoke('listLocalRagDocuments') as { success: boolean, data?: any[], error?: string };
      if (response.success && response.data) {
        get().setIndexedDocuments(response.data);
        console.log('[KnowledgeBaseStore] Fetched indexed documents:', response.data.length);
        return { success: true };
      } else {
        console.error('[KnowledgeBaseStore] Failed to fetch indexed documents from main process:', response.error);
        get().setIndexedDocuments([]);
        return { success: false, error: response.error || 'Unknown error fetching documents.' };
      }
    } catch (error: any) {
      console.error('[KnowledgeBaseStore] Error invoking listLocalRagDocuments IPC:', error);
      get().setIndexedDocuments([]); // Set to empty on error
      return { success: false, error: error.message || 'IPC communication error.' };
    }
  },
  removeDocumentById: async (documentId: string): Promise<{ success: boolean; message?: string }> => {
    console.log(`[KnowledgeBaseStore] Attempting to remove document: ${documentId}`);
    if (!window.electron || !window.electron.ipcRenderer) {
      const errorMsg = 'Electron IPC not available.';
      console.error(`[KnowledgeBaseStore] ${errorMsg}`);
      return { success: false, message: errorMsg };
    }
    try {
      const result = await window.electron.ipcRenderer.invoke('deleteLocalRagDocument', documentId) as { success: boolean; message: string };
      if (result.success) {
        console.log(`[KnowledgeBaseStore] Document ${documentId} removed successfully via IPC. Refreshing list.`);
        await get().fetchIndexedDocuments(); // Refresh the list after successful deletion
        return { success: true, message: result.message };
      } else {
        console.error(`[KnowledgeBaseStore] Failed to remove document ${documentId} via IPC:`, result.message);
        return { success: false, message: result.message || 'Failed to delete document from main process.' };
      }
    } catch (error: any) {
      console.error(`[KnowledgeBaseStore] Error invoking deleteLocalRagDocument IPC for ${documentId}:`, error);
      return { success: false, message: error.message || 'IPC communication error during deletion.' };
    }
  },
});
