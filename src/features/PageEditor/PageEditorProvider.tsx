'use client';

import { useEditor } from '@lobehub/editor/react';
import { ReactNode, memo } from 'react';

import StoreUpdater, { StoreUpdaterProps } from './StoreUpdater';
import { Provider, createStore } from './store';

interface PageEditorProviderProps extends StoreUpdaterProps {
  children: ReactNode;
}

export const PageEditorProvider = memo<PageEditorProviderProps>(
  ({
    children,
    pageId,
    knowledgeBaseId,
    autoSave,
    onDocumentIdChange,
    onSave,
    onDelete,
    onBack,
    parentId,
  }) => {
    const editor = useEditor();

    return (
      <Provider
        createStore={() =>
          createStore({
            autoSave,
            editor,
            knowledgeBaseId,
            onBack,
            onDelete,
            onDocumentIdChange,
            onSave,
            pageId,
            parentId,
          })
        }
      >
        <StoreUpdater
          autoSave={autoSave}
          knowledgeBaseId={knowledgeBaseId}
          onBack={onBack}
          onDelete={onDelete}
          onDocumentIdChange={onDocumentIdChange}
          onSave={onSave}
          pageId={pageId}
          parentId={parentId}
        />
        {children}
      </Provider>
    );
  },
);
