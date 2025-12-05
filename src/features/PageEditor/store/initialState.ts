import { IEditor } from '@lobehub/editor';

export interface PublicState {
  autoSave?: boolean;
  knowledgeBaseId?: string;
  onBack?: () => void;
  onDelete?: () => void;
  onDocumentIdChange?: (newId: string) => void;
  onSave?: () => void;
  pageId?: string;
  parentId?: string;
}

export interface State extends PublicState {
  chatPanelExpanded: boolean;
  currentDocId: string | undefined;
  currentEmoji: string | undefined;
  currentTitle: string;
  editor?: IEditor;
  editorState?: any; // EditorState from useEditorState hook
  isDirty: boolean; // Track if there are unsaved changes
  lastSavedContent: string; // Last saved content hash for comparison
  lastUpdatedTime: Date | null;
  saveStatus: 'idle' | 'saving' | 'saved';
  wordCount: number;
}

export const initialState: State = {
  autoSave: true,
  chatPanelExpanded: false,
  currentDocId: undefined,
  currentEmoji: undefined,
  currentTitle: '',
  isDirty: false,
  lastSavedContent: '',
  lastUpdatedTime: null,
  saveStatus: 'idle',
  wordCount: 0,
};
