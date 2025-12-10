'use client';

import { useEditorState } from '@lobehub/editor/react';
import React, { memo, useEffect, useRef } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useChatStore } from '@/store/chat';
import { pageAgentRuntime } from '@/store/chat/slices/builtinTool/actions/pageAgent';
import { useFileStore } from '@/store/file';
import { documentSelectors } from '@/store/file/slices/document/selectors';

import { PublicState, usePageEditorStore, useStoreApi } from './store';

export type StoreUpdaterProps = Partial<PublicState>;

const StoreUpdater = memo<StoreUpdaterProps>(
  ({
    pageId,
    knowledgeBaseId,
    autoSave,
    onDocumentIdChange,
    onSave,
    onDelete,
    onBack,
    parentId,
  }) => {
    const storeApi = useStoreApi();
    const useStoreUpdater = createStoreUpdater(storeApi);

    const editor = usePageEditorStore((s) => s.editor);
    const editorState = useEditorState(editor);
    const currentDocId = usePageEditorStore((s) => s.currentDocId);

    const updateActivePageId = useChatStore((s) => s.internal_updateActivePageId);
    const currentPage = useFileStore(documentSelectors.getDocumentById(pageId));

    const [editorInit, setEditorInit] = React.useState(false);
    const [contentInit, setContentInit] = React.useState(false);
    const lastLoadedDocIdRef = useRef<string | undefined>(undefined);

    // Update editorState in store
    useEffect(() => {
      storeApi.setState({ editorState });
    }, [editorState, storeApi]);

    // Update store with props
    useStoreUpdater('pageId', pageId);
    useStoreUpdater('knowledgeBaseId', knowledgeBaseId);
    useStoreUpdater('autoSave', autoSave ?? true);
    useStoreUpdater('onDocumentIdChange', onDocumentIdChange);
    useStoreUpdater('onSave', onSave);
    useStoreUpdater('onDelete', onDelete);
    useStoreUpdater('onBack', onBack);
    useStoreUpdater('parentId', parentId);

    // Initialize currentDocId and document metadata
    useEffect(() => {
      if (pageId !== lastLoadedDocIdRef.current) {
        lastLoadedDocIdRef.current = pageId;
        setContentInit(false);

        storeApi.setState({
          currentDocId: pageId,
          currentEmoji: currentPage?.metadata?.emoji,
          currentTitle: currentPage?.title || '',
        });
      }
    }, [pageId, currentPage, storeApi]);

    // Load content into editor after initialization
    useEffect(() => {
      if (!editorInit || !editor || contentInit) return;

      // Defer editor content loading to avoid flushSync warning
      queueMicrotask(() => {
        try {
          // Helper to calculate word count
          const calculateWordCount = (text: string) =>
            text.trim().split(/\s+/).filter(Boolean).length;

          storeApi.setState({ lastUpdatedTime: null });

          // Load from editorData if available
          if (currentPage?.editorData && Object.keys(currentPage.editorData).length > 0) {
            editor.setDocument('json', JSON.stringify(currentPage.editorData));
            const textContent = currentPage.content || '';
            storeApi.setState({ wordCount: calculateWordCount(textContent) });
          } else if (currentPage?.content && currentPage.content.trim()) {
            // Fallback to markdown content (e.g., from Notion imports)
            editor.setDocument('markdown', currentPage.content);
            storeApi.setState({ wordCount: calculateWordCount(currentPage.content) });
          } else if (currentPage?.pages) {
            // Fallback to pages content
            const pagesContent = currentPage.pages
              .map((page) => page.pageContent)
              .join('\n\n')
              .trim();
            if (pagesContent) {
              editor.setDocument('markdown', pagesContent);
              storeApi.setState({ wordCount: calculateWordCount(pagesContent) });
            } else {
              editor.setDocument('text', '');
              storeApi.setState({ wordCount: 0 });
            }
          } else {
            // Empty document or temp page - clear editor
            editor.setDocument('text', '');
            storeApi.setState({ wordCount: 0 });
          }

          setContentInit(true);
        } catch (error) {
          console.error('[PageEditor] Failed to initialize editor content:', error);
        }
      });
    }, [editorInit, contentInit, editor, pageId, currentPage, storeApi]);

    // Track editor initialization
    useEffect(() => {
      if (editor && !editorInit) {
        setEditorInit(true);
      }
    }, [editor, editorInit]);

    // Connect editor to page agent runtime
    useEffect(() => {
      if (editor) {
        pageAgentRuntime.setEditor(editor);
      }
      return () => {
        pageAgentRuntime.setEditor(null);
      };
    }, [editor]);

    // Connect title handlers to page agent runtime
    useEffect(() => {
      const titleSetter = (title: string) => {
        storeApi.setState({ currentTitle: title });
      };

      const titleGetter = () => {
        return storeApi.getState().currentTitle;
      };

      pageAgentRuntime.setTitleHandlers(titleSetter, titleGetter);

      return () => {
        pageAgentRuntime.setTitleHandlers(null, null);
      };
    }, [storeApi]);

    // Update activePageId in chat store when page changes
    useEffect(() => {
      // Use currentDocId (which includes temp docs) or fallback to pageId
      const activeId = currentDocId || pageId;
      console.log('[StoreUpdater] Updating activePageId in chat store:', activeId);
      updateActivePageId(activeId);

      // Cleanup: clear activePageId when unmounting
      return () => {
        console.log('[StoreUpdater] Clearing activePageId on unmount');
        updateActivePageId(undefined);
      };
    }, [currentDocId, pageId, updateActivePageId]);

    return null;
  },
);

export default StoreUpdater;
