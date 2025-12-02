import { useEditor } from '@lobehub/editor/react';
import { useDebounceFn } from 'ahooks';
import { useCallback, useEffect, useRef, useState } from 'react';

import { documentService } from '@/services/document';
import { useFileStore } from '@/store/file';
import { documentSelectors } from '@/store/file/slices/document/selectors';
import { DocumentSourceType, LobeDocument } from '@/types/document';

const SAVE_THROTTLE_TIME = 3000; // ms
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

interface SaveOptions {
  content: string;
  editorData: any;
  emoji?: string;
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

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentEmoji, setCurrentEmoji] = useState<string | undefined>(undefined);
  const [currentDocId, setCurrentDocId] = useState<string | undefined>(documentId);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const refreshFileList = useFileStore((s) => s.refreshFileList);
  const updateDocumentOptimistically = useFileStore((s) => s.updateDocumentOptimistically);
  const replaceTempDocumentWithReal = useFileStore((s) => s.replaceTempDocumentWithReal);

  const isInitialLoadRef = useRef(false);
  const lastLoadedDocIdRef = useRef<string | undefined>(undefined);

  // Helper function to calculate word count from text
  const calculateWordCount = useCallback((text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, []);

  // Helper function to extract content from pages array
  const extractContentFromPages = useCallback((pages?: Array<{ pageContent: string }>) => {
    if (!pages || pages.length === 0) return null;
    return pages.map((page) => page.pageContent).join('\n\n');
  }, []);

  // Sync title and emoji ONLY when documentId changes (new page loaded)
  useEffect(() => {
    // Only sync when we're loading a new document
    if (documentId !== lastLoadedDocIdRef.current) {
      lastLoadedDocIdRef.current = documentId;

      if (currentPage?.title !== undefined) {
        setCurrentTitle(currentPage.title);
      }
      if (currentPage?.metadata?.emoji !== undefined) {
        setCurrentEmoji(currentPage.metadata.emoji);
      }
    }
  }, [documentId]); // Only watch documentId, not currentPage

  // Load page content when documentId changes
  const onEditorInit = () => {
    isInitialLoadRef.current = true;

    if (documentId && editor) {
      setCurrentEmoji(currentPage?.metadata?.emoji);
      setLastUpdatedTime(null);

      // Check if this is an optimistic temp page
      if (currentPage && documentId.startsWith('temp-document-')) {
        console.log('[usePageEditor] Using optimistic page from currentPage');
        setCurrentTitle(currentPage.title || 'Untitled Page');
        // editor.cleanDocument();
        setWordCount(0);
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, RESET_DELAY);
        return;
      }

      if (currentPage?.editorData && Object.keys(currentPage.editorData).length > 0) {
        setCurrentTitle(currentPage.title || '');
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
          setCurrentTitle(currentPage.title || '');
          isInitialLoadRef.current = true;
          editor.setDocument('markdown', pagesContent);
          setWordCount(calculateWordCount(pagesContent));
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, RESET_DELAY);
          return;
        }
      } else {
        // editor.cleanDocument();
        setWordCount(0);
        isInitialLoadRef.current = false;
        return;
      }
    }
  };

  // Save function
  const performSave = useCallback(
    async (options?: Partial<SaveOptions>) => {
      if (!editor) return;

      const editorData = editor.getDocument('json');
      const textContent = (editor.getDocument('markdown') as unknown as string) || '';

      // Don't save if content is empty
      if (!textContent || textContent.trim() === '') {
        return;
      }

      // Store focus state before saving
      const editorElement = editor.getRootElement();
      const hadFocus = editorElement?.contains(document.activeElement) ?? false;

      setSaveStatus('saving');

      try {
        const title = options?.title ?? currentTitle;
        const emoji = options?.emoji !== undefined ? options.emoji : currentEmoji;

        if (currentDocId && !currentDocId.startsWith('temp-document-')) {
          // Update existing page
          await updateDocumentOptimistically(currentDocId, {
            content: textContent,
            editorData: structuredClone(editorData),
            metadata: emoji ? { emoji } : { emoji: undefined },
            title,
            updatedAt: new Date(),
          });

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
          const finalTitle = title || `Page - ${timestamp}`;

          const newPage = await documentService.createDocument({
            content: textContent,
            editorData: JSON.stringify(editorData),
            fileType: 'custom/document',
            knowledgeBaseId,
            metadata: emoji ? { createdAt: now, emoji } : { createdAt: now },
            parentId,
            title: finalTitle,
          });

          const realPage: LobeDocument = {
            content: textContent,
            createdAt: new Date(now),
            editorData: structuredClone(editorData) || null,
            fileType: 'custom/document' as const,
            filename: finalTitle,
            id: newPage.id,
            metadata: emoji ? { createdAt: now, emoji } : { createdAt: now },
            source: 'document',
            sourceType: DocumentSourceType.EDITOR,
            title: finalTitle,
            totalCharCount: textContent.length,
            totalLineCount: 0,
            updatedAt: new Date(now),
          };

          if (currentDocId?.startsWith('temp-document-')) {
            replaceTempDocumentWithReal(currentDocId, realPage);
          }

          setCurrentDocId(newPage.id);
          onDocumentIdChange?.(newPage.id);

          refreshFileList();

          if (hadFocus) {
            setTimeout(() => {
              editor.focus();
            }, 0);
          }
        }

        setSaveStatus('saved');
        setLastUpdatedTime(new Date());

        onSave?.();
      } catch {
        setSaveStatus('idle');
      }
    },
    [
      editor,
      currentDocId,
      currentTitle,
      currentEmoji,
      knowledgeBaseId,
      refreshFileList,
      updateDocumentOptimistically,
      onSave,
      onDocumentIdChange,
      replaceTempDocumentWithReal,
    ],
  );

  // Handle content change - auto-save after debounce
  const handleContentChangeInternal = useCallback(() => {
    if (isInitialLoadRef.current) {
      console.log('[usePageEditor] Skipping onChange during initial load');
      return;
    }

    console.log('[usePageEditor] Content changed, triggering auto-save');

    if (editor) {
      try {
        const textContent = (editor.getDocument('text') as unknown as string) || '';
        setWordCount(calculateWordCount(textContent));
      } catch (error) {
        console.error('Failed to update word count:', error);
      }
    }

    if (autoSave) {
      performSave();
    }
  }, [performSave, editor, calculateWordCount, autoSave]);

  const { run: handleContentChange } = useDebounceFn(handleContentChangeInternal, {
    wait: SAVE_THROTTLE_TIME,
  });

  // Debounced save for title/emoji changes
  const { run: debouncedSave } = useDebounceFn(performSave, {
    wait: SAVE_THROTTLE_TIME,
  });

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
    // State
    currentDocId,
    currentEmoji,
    currentTitle,
    // Methods
    debouncedSave,

    handleContentChange,

    lastUpdatedTime,

    onEditorInit,

    performSave,

    saveStatus,
    // Setters
    setCurrentEmoji,
    setCurrentTitle,

    wordCount,
  };
};
