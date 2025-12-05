import { EDITOR_DEBOUNCE_TIME, EDITOR_MAX_WAIT } from '@lobechat/const';
import { debounce } from 'lodash-es';
import { StateCreator } from 'zustand';

import { State, initialState } from './initialState';

type SaveConfigPayload = {
  editorData: Record<string, any>;
  systemRole: string;
};

export interface Action {
  flushSave: () => void;
  handleContentChange: (updateConfig: (payload: SaveConfigPayload) => Promise<void>) => void;
  setChatPanelExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void;
}

export type Store = State & Action;

// Create debounced save function outside of store for reuse
const createDebouncedSave = (
  get: () => Store,
  updateConfig: (payload: SaveConfigPayload) => Promise<void>,
) =>
  debounce(
    async (payload: SaveConfigPayload) => {
      try {
        await updateConfig(payload);
      } catch (error) {
        console.error('[ProfileEditor] Failed to save:', error);
      }
    },
    EDITOR_DEBOUNCE_TIME,
    { leading: false, maxWait: EDITOR_MAX_WAIT, trailing: true },
  );

export const store: (initState?: Partial<State>) => StateCreator<Store> =
  (initState) => (set, get) => {
    let debouncedSave: ReturnType<typeof createDebouncedSave> | null = null;

    return {
      ...initialState,
      ...initState,

      flushSave: () => {
        debouncedSave?.flush();
      },

      handleContentChange: (updateConfig) => {
        const { editor } = get();
        if (!editor) return;

        // Create debounced save on first use
        if (!debouncedSave) {
          debouncedSave = createDebouncedSave(get, updateConfig);
        }

        try {
          const markdownContent = (editor.getDocument('markdown') as unknown as string) || '';
          const jsonContent = editor.getDocument('json') as unknown as Record<string, any>;

          debouncedSave({
            editorData: structuredClone(jsonContent || {}),
            systemRole: markdownContent || '',
          });
        } catch (error) {
          console.error('[ProfileEditor] Failed to read editor content:', error);
        }
      },

      setChatPanelExpanded: (expanded) => {
        if (typeof expanded === 'function') {
          set((state) => ({ chatPanelExpanded: expanded(state.chatPanelExpanded) }));
        } else {
          set({ chatPanelExpanded: expanded });
        }
      },
    };
  };
