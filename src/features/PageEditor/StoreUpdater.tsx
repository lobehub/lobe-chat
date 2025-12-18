'use client';

import { useEditorState } from '@lobehub/editor/react';
import React, { memo, useEffect, useRef } from 'react';
import { createStoreUpdater } from 'zustand-utils';

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

    const fetchDocumentDetail = useFileStore((s) => s.fetchDocumentDetail);
    const currentPage = useFileStore(documentSelectors.getDocumentById(pageId));

    const [editorInit, setEditorInit] = React.useState(false);
    const [contentInit, setContentInit] = React.useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
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

    // Fetch full document detail when pageId changes
    useEffect(() => {
      if (pageId && pageId !== lastLoadedDocIdRef.current) {
        console.log('[StoreUpdater] PageId changed, fetching detail:', pageId);
        // Immediately show loading state and reset for better UX
        setIsLoadingDetail(true);
        setContentInit(false);
        storeApi.setState({
          currentTitle: '',
          isLoadingContent: true,
          wordCount: 0,
        });

        // Fetch the full document detail
        fetchDocumentDetail(pageId)
          .then(() => {
            console.log('[StoreUpdater] Document detail fetched successfully for:', pageId);
          })
          .finally(() => {
            console.log('[StoreUpdater] Setting isLoadingDetail to false');
            setIsLoadingDetail(false);
          });
      }
    }, [pageId, fetchDocumentDetail, storeApi]);

    // Initialize currentDocId and document metadata after fetch completes
    useEffect(() => {
      if (pageId !== lastLoadedDocIdRef.current && !isLoadingDetail) {
        console.log('[StoreUpdater] Initializing metadata for pageId:', pageId, {
          hasEditorData: !!currentPage?.editorData,
          title: currentPage?.title,
        });
        lastLoadedDocIdRef.current = pageId;
        setContentInit(false);

        storeApi.setState({
          currentDocId: pageId,
          currentEmoji: currentPage?.metadata?.emoji,
          currentTitle: currentPage?.title || '',
        });
      }
    }, [pageId, currentPage, storeApi, isLoadingDetail]);

    // Load content into editor after initialization
    useEffect(() => {
      console.log('[StoreUpdater] Content loading effect check:', {
        contentInit,
        editorInit,
        hasCurrentPage: !!currentPage,
        hasEditor: !!editor,
        hasEditorData: !!currentPage?.editorData,
        isLoadingDetail,
        pageId,
      });

      if (!editorInit || !editor || contentInit || isLoadingDetail) return;

      // Defer editor content loading to avoid flushSync warning
      queueMicrotask(() => {
        try {
          console.log('[StoreUpdater] Loading content for page:', pageId);

          // Safety check: ensure we're loading content for the current page
          // This prevents loading old content when currentPage has stale data
          const currentState = storeApi.getState();
          if (currentState.currentDocId && currentState.currentDocId !== pageId) {
            console.log('[StoreUpdater] Skipping content load - currentDocId mismatch', {
              currentDocId: currentState.currentDocId,
              pageId,
            });
            return;
          }

          // Helper to calculate word count
          const calculateWordCount = (text: string) =>
            text.trim().split(/\s+/).filter(Boolean).length;

          storeApi.setState({ lastUpdatedTime: null });

          // Load from editorData if available
          if (currentPage?.editorData && Object.keys(currentPage.editorData).length > 0) {
            console.log('[StoreUpdater] Loading from editorData');
            editor.setDocument('json', JSON.stringify(currentPage.editorData));
            const textContent = currentPage.content || '';
            storeApi.setState({ wordCount: calculateWordCount(textContent) });
          } else if (currentPage?.content && currentPage.content.trim()) {
            console.log('[StoreUpdater] Loading from content (markdown)');
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
              console.log('[StoreUpdater] Loading from pages content');
              editor.setDocument('markdown', pagesContent);
              storeApi.setState({ wordCount: calculateWordCount(pagesContent) });
            } else {
              console.log('[StoreUpdater] Clearing editor - empty pages');
              editor.setDocument('markdown', ' ');
              storeApi.setState({ wordCount: 0 });
            }
          } else {
            // Empty document or temp page - clear editor with minimal content
            console.log('[StoreUpdater] Clearing editor - empty/new page');
            editor.setDocument('markdown', ' ');
            storeApi.setState({ wordCount: 0 });
          }

          setContentInit(true);
          storeApi.setState({ isLoadingContent: false });
        } catch (error) {
          console.error('[PageEditor] Failed to initialize editor content:', error);
          storeApi.setState({ isLoadingContent: false });
        }
      });
    }, [
      editorInit,
      contentInit,
      editor,
      pageId,
      currentPage,
      storeApi,
      isLoadingDetail,
      currentDocId,
    ]);

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

    // Update current document ID in page agent runtime when page changes
    useEffect(() => {
      // Use currentDocId (which includes temp docs) or fallback to pageId
      const activeId = currentDocId || pageId;
      console.log('[StoreUpdater] Updating currentDocId in page agent runtime:', activeId);
      pageAgentRuntime.setCurrentDocId(activeId);

      // Cleanup: clear currentDocId when unmounting
      return () => {
        console.log('[StoreUpdater] Clearing currentDocId on unmount');
        pageAgentRuntime.setCurrentDocId(undefined);
      };
    }, [currentDocId, pageId]);

    return null;
  },
);

export default StoreUpdater;
