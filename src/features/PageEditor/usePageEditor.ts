import { useEditor } from '@lobehub/editor/react';
import { useDebounceFn, useInterval } from 'ahooks';
import { useCallback, useEffect, useRef, useState } from 'react';

import { documentService } from '@/services/document';
import { useFileStore } from '@/store/file';
import { documentSelectors } from '@/store/file/slices/document/selectors';
import { DocumentSourceType, LobeDocument } from '@/types/document';

const SAVE_INTERVAL_TIME = 5000; // Auto-save every 5 seconds
const DEBOUNCE_TIME = 1000; // Debounce time for user input
const RESET_DELAY = 100; // ms

type EditorInstance = ReturnType<typeof useEditor>;

interface UsePageEditorOptions {
  autoSave?: boolean;
  documentId?: string;
  editor: EditorInstance;
  knowledgeBaseId?: string;
  onDocumentIdChange?: (newId: string) => void;
  onSave?: () => void;
  parentId?: string;
}

interface LocalEditorState {
  content: string;
  editorData: any;
  emoji?: string;
  isDirty: boolean;
  title: string;
}

export const usePageEditor = ({
  autoSave = true,
  documentId,
  editor,
  knowledgeBaseId,
  onDocumentIdChange,
  onSave,
  parentId,
}: UsePageEditorOptions) => {
  const currentPage = useFileStore(documentSelectors.getDocumentById(documentId));

  // Local state - independent from Zustand
  const [localState, setLocalState] = useState<LocalEditorState>({
    content: '',
    editorData: null,
    emoji: undefined,
    isDirty: false,
    title: '',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentDocId, setCurrentDocId] = useState<string | undefined>(documentId);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const updateDocumentOptimistically = useFileStore((s) => s.updateDocumentOptimistically);
  const replaceTempDocumentWithReal = useFileStore((s) => s.replaceTempDocumentWithReal);
  const refreshFileList = useFileStore((s) => s.refreshFileList);

  const isInitialLoadRef = useRef(false);
  const lastLoadedDocIdRef = useRef<string | undefined>(undefined);
  const isSavingRef = useRef(false);
  const hasInitializedEditorRef = useRef<string | undefined>(undefined);

  // Helper function to calculate word count from text
  const calculateWordCount = useCallback((text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, []);

  // Helper function to extract content from pages array
  const extractContentFromPages = useCallback((pages?: Array<{ pageContent: string }>) => {
    if (!pages || pages.length === 0) return null;
    return pages.map((page) => page.pageContent).join('\n\n');
  }, []);

  // Initialize local state from Zustand ONLY when documentId changes (new page loaded)
  useEffect(() => {
    // Only sync when we're loading a new document
    if (documentId !== lastLoadedDocIdRef.current) {
      lastLoadedDocIdRef.current = documentId;
      // Reset the initialization flag when switching documents
      hasInitializedEditorRef.current = undefined;

      if (currentPage) {
        setLocalState({
          content: currentPage.content || '',
          editorData: currentPage.editorData || null,
          emoji: currentPage.metadata?.emoji,
          isDirty: false,
          title: currentPage.title || '',
        });
      } else {
        // New empty document
        setLocalState({
          content: '',
          editorData: null,
          emoji: undefined,
          isDirty: false,
          title: '',
        });
      }
    }
    // IMPORTANT: Only depend on documentId, NOT currentPage
    // This prevents overwriting local edits when Zustand store updates
  }, [documentId]);

  // Load page content when documentId changes
  const onEditorInit = useCallback(() => {
    // CRITICAL: Only initialize editor content ONCE per document
    // If we've already initialized this document, skip to prevent overwriting user edits
    if (hasInitializedEditorRef.current === documentId) {
      console.log('[usePageEditor] Skipping onEditorInit - already initialized for', documentId);
      return;
    }

    console.log('[usePageEditor] onEditorInit called for document:', documentId);
    isInitialLoadRef.current = true;

    if (documentId && editor) {
      setLastUpdatedTime(null);
      hasInitializedEditorRef.current = documentId;

      // Check if this is an optimistic temp page
      if (currentPage && documentId.startsWith('temp-document-')) {
        console.log('[usePageEditor] Using optimistic page from currentPage');
        setWordCount(0);
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, RESET_DELAY);
        return;
      }

      if (currentPage?.editorData && Object.keys(currentPage.editorData).length > 0) {
        isInitialLoadRef.current = true;

        console.log('[usePageEditor] Setting editor data', currentPage.editorData);

        editor.setDocument('json', JSON.stringify(currentPage.editorData));
        const textContent = currentPage.content || '';
        setWordCount(calculateWordCount(textContent));
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, RESET_DELAY);
        return;
      } else if (currentPage?.pages && editor) {
        const pagesContent = extractContentFromPages(currentPage.pages);
        if (pagesContent) {
          console.log('[usePageEditor] Using pages content as fallback');
          isInitialLoadRef.current = true;
          editor.setDocument('markdown', pagesContent);
          setWordCount(calculateWordCount(pagesContent));
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, RESET_DELAY);
          return;
        }
      } else {
        setWordCount(0);
        isInitialLoadRef.current = false;
        return;
      }
    }
  }, [documentId, editor, currentPage, calculateWordCount, extractContentFromPages]);

  // Sync to DB using Zustand action
  const syncToDatabase = useCallback(async () => {
    if (!localState.isDirty || !editor || isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      // Store focus state before saving
      const editorElement = editor.getRootElement();
      const hadFocus = editorElement?.contains(document.activeElement) ?? false;

      // Get the latest content and editorData from the editor at save time
      const currentEditorData = editor.getDocument('json');
      const currentContent = (editor.getDocument('markdown') as unknown as string) || '';

      // Don't save if content is empty
      if (!currentContent || currentContent.trim() === '') {
        isSavingRef.current = false;
        setSaveStatus('idle');
        return;
      }

      if (currentDocId && !currentDocId.startsWith('temp-document-')) {
        // Update existing page with latest editor content
        await updateDocumentOptimistically(currentDocId, {
          content: currentContent,
          editorData: structuredClone(currentEditorData),
          metadata: localState.emoji ? { emoji: localState.emoji } : { emoji: undefined },
          title: localState.title,
          updatedAt: new Date(),
        });

        // Restore focus after save if it was focused before
        if (hadFocus) {
          setTimeout(() => {
            editor.focus();
          }, 0);
        }
      } else {
        // Create new page
        const now = Date.now();
        const timestamp = new Date(now).toLocaleString('en-US', {
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const finalTitle = localState.title || `Page - ${timestamp}`;

        const newPage = await documentService.createDocument({
          content: currentContent,
          editorData: JSON.stringify(currentEditorData),
          fileType: 'custom/document',
          knowledgeBaseId,
          metadata: localState.emoji
            ? { createdAt: now, emoji: localState.emoji }
            : { createdAt: now },
          parentId,
          title: finalTitle,
        });

        const realPage: LobeDocument = {
          content: currentContent,
          createdAt: new Date(now),
          editorData: structuredClone(currentEditorData) || null,
          fileType: 'custom/document' as const,
          filename: finalTitle,
          id: newPage.id,
          metadata: localState.emoji
            ? { createdAt: now, emoji: localState.emoji }
            : { createdAt: now },
          source: 'document',
          sourceType: DocumentSourceType.EDITOR,
          title: finalTitle,
          totalCharCount: currentContent.length,
          totalLineCount: 0,
          updatedAt: new Date(now),
        };

        if (currentDocId?.startsWith('temp-document-')) {
          replaceTempDocumentWithReal(currentDocId, realPage);
        }

        setCurrentDocId(newPage.id);
        onDocumentIdChange?.(newPage.id);

        refreshFileList();

        // Restore focus after save if it was focused before
        if (hadFocus) {
          setTimeout(() => {
            editor.focus();
          }, 0);
        }
      }

      // Mark as clean after successful save
      setLocalState((prev) => ({ ...prev, isDirty: false }));
      setSaveStatus('saved');
      setLastUpdatedTime(new Date());

      onSave?.();
    } catch (error) {
      console.error('[syncToDatabase] Failed to save:', error);
      setSaveStatus('idle');
    } finally {
      isSavingRef.current = false;
    }
  }, [
    localState,
    editor,
    currentDocId,
    knowledgeBaseId,
    parentId,
    updateDocumentOptimistically,
    replaceTempDocumentWithReal,
    onDocumentIdChange,
    refreshFileList,
    onSave,
  ]);

  // Manual save function (for Cmd+S or explicit save)
  const performSave = useCallback(async () => {
    await syncToDatabase();
  }, [syncToDatabase]);

  // Handle content change - update local state and mark as dirty
  const handleContentChangeInternal = useCallback(() => {
    if (isInitialLoadRef.current) {
      console.log('[usePageEditor] Skipping onChange during initial load');
      return;
    }

    console.log('[usePageEditor] Content changed, updating local state');

    if (editor) {
      try {
        const textContent = (editor.getDocument('text') as unknown as string) || '';
        const markdownContent = (editor.getDocument('markdown') as unknown as string) || '';
        const editorData = editor.getDocument('json');

        setWordCount(calculateWordCount(textContent));
        setLocalState((prev) => ({
          ...prev,
          content: markdownContent,
          editorData,
          isDirty: true,
        }));
      } catch (error) {
        console.error('Failed to update content:', error);
      }
    }
  }, [editor, calculateWordCount]);

  const { run: handleContentChange } = useDebounceFn(handleContentChangeInternal, {
    wait: DEBOUNCE_TIME,
  });

  // Update title in local state
  const setCurrentTitle = useCallback((title: string) => {
    setLocalState((prev) => ({ ...prev, isDirty: true, title }));
  }, []);

  // Update emoji in local state
  const setCurrentEmoji = useCallback((emoji: string | undefined) => {
    setLocalState((prev) => ({ ...prev, emoji, isDirty: true }));
  }, []);

  // Debounced save for title/emoji changes
  const { run: debouncedSave } = useDebounceFn(syncToDatabase, {
    wait: DEBOUNCE_TIME,
  });

  // Interval-based auto-save
  useInterval(
    () => {
      if (autoSave && localState.isDirty) {
        syncToDatabase();
      }
    },
    autoSave ? SAVE_INTERVAL_TIME : undefined,
  );

  // Update currentDocId when documentId prop changes
  useEffect(() => {
    setCurrentDocId(documentId);
  }, [documentId]);

  // Clean up when closing
  useEffect(() => {
    return () => {
      // editor?.cleanDocument();
    };
  }, [editor]);

  return {
    // State - from local state
    currentDocId,
    currentEmoji: localState.emoji,
    currentTitle: localState.title,
    // Methods
debouncedSave,
    
handleContentChange,
    
lastUpdatedTime,
    
    onEditorInit,
    performSave,
    saveStatus,
    // Setters - update local state
setCurrentEmoji,
    
    setCurrentTitle,
    wordCount,
  };
};
