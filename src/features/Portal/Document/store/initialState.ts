'use client';

import { IEditor } from '@lobehub/editor';

export interface DocumentEditorState {
  documentId: string | undefined;
  editor?: IEditor;
  isDirty: boolean;
  lastSavedContent: string;
  saveStatus: 'idle' | 'saving' | 'saved';
  topicId: string | undefined;
}

export const initialDocumentEditorState: DocumentEditorState = {
  documentId: undefined,
  isDirty: false,
  lastSavedContent: '',
  saveStatus: 'idle',
  topicId: undefined,
};
