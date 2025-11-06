'use client';

import {
  HotkeyEnum,
  ReactCodePlugin,
  ReactCodeblockPlugin,
  ReactHRPlugin,
  ReactLinkHighlightPlugin,
  ReactListPlugin,
  ReactMathPlugin,
  ReactTablePlugin,
  getHotkeyById,
} from '@lobehub/editor';
import {
  ChatInputActionBar,
  ChatInputActions,
  type ChatInputActionsProps,
  CodeLanguageSelect,
  Editor,
  useEditor,
  useEditorState,
} from '@lobehub/editor/react';
import { Button, Icon } from '@lobehub/ui';
import { useDebounceFn } from 'ahooks';
import { css, cx, useTheme } from 'antd-style';
import {
  BoldIcon,
  CodeXmlIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  Loader2Icon,
  MessageSquareQuote,
  SigmaIcon,
  SmilePlus,
  SquareDashedBottomCodeIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { documentService } from '@/services/document';
import { useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';

const SAVE_THROTTLE_TIME = 3000; // 3 seconds

const EmojiPicker = dynamic(() => import('@lobehub/ui/es/EmojiPicker'), { ssr: false });

const editorClassName = cx(css`
  p {
    margin-block-end: 0;
  }
`);

interface DocumentEditorPanelProps {
  content?: string | null;
  documentId?: string;
  documentTitle?: string;
  editorData?: Record<string, any> | null;
  emoji?: string;
  knowledgeBaseId?: string;
  onDocumentIdChange?: (newId: string) => void;
  onSave?: () => void;
}

const DocumentEditor = memo<DocumentEditorPanelProps>(
  ({
    content: cachedContent,
    documentId,
    documentTitle,
    editorData: cachedEditorData,
    emoji: cachedEmoji,
    knowledgeBaseId,
    onDocumentIdChange,
    onSave,
  }) => {
    const { t } = useTranslation(['file', 'editor']);
    const theme = useTheme();
    const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);

    const editor = useEditor();
    const editorState = useEditorState(editor);

    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [currentTitle, setCurrentTitle] = useState('');
    const [currentEmoji, setCurrentEmoji] = useState<string | undefined>(undefined);
    const [isHoveringTitle, setIsHoveringTitle] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [currentDocId, setCurrentDocId] = useState<string | undefined>(documentId);
    const refreshFileList = useFileStore((s) => s.refreshFileList);
    const updateDocumentOptimistically = useFileStore((s) => s.updateDocumentOptimistically);
    const localDocumentMap = useFileStore((s) => s.localDocumentMap);
    const replaceTempDocumentWithReal = useFileStore((s) => s.replaceTempDocumentWithReal);
    const isInitialLoadRef = useRef(false);

    // Load document content when documentId changes
    useEffect(() => {
      // Reset initial load flag when switching documents
      isInitialLoadRef.current = true;

      if (documentId && editor) {
        console.log('[DocumentEditor] Loading content:', {
          cachedEditorDataPreview: cachedEditorData
            ? JSON.stringify(cachedEditorData).slice(0, 100)
            : null,
          cachedEditorDataType: typeof cachedEditorData,
          cachedEmoji,
          documentId,
          documentTitle,
          hasCachedEditorData: !!cachedEditorData,
          isTempDocument: documentId.startsWith('temp-document-'),
        });

        // Reset emoji picker state when switching documents
        setShowEmojiPicker(false);
        // Initialize emoji from cached value
        setCurrentEmoji(cachedEmoji);

        // Check if this is an optimistic document from local map
        const localDocument = localDocumentMap.get(documentId);
        if (localDocument && documentId.startsWith('temp-document-')) {
          console.log('[DocumentEditor] Using optimistic document from local map');
          setCurrentTitle(localDocument.name || 'Untitled Document');
          // Start with empty editor for new documents
          editor.cleanDocument();
          // Reset flag after cleanDocument (no onChange should fire for cleanDocument)
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 500);
          return;
        }

        // If editorData is already cached (from list), check if it's valid
        const hasValidCachedEditorData =
          cachedEditorData &&
          typeof cachedEditorData === 'object' &&
          Object.keys(cachedEditorData).length > 0;

        console.log('[DocumentEditor] Cached data check:', {
          cachedContent,
          cachedEditorData,
          hasCachedContent: !!cachedContent,
          hasValidCachedEditorData,
          keys: cachedEditorData ? Object.keys(cachedEditorData) : null,
        });

        if (hasValidCachedEditorData) {
          console.log('[DocumentEditor] Using cached editorData', cachedEditorData);
          setCurrentTitle(documentTitle || '');
          isInitialLoadRef.current = true;
          editor.setDocument('json', JSON.stringify(cachedEditorData));
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 500);
          return;
        }

        // If no valid editorData but has cached content, use markdown format
        if (!hasValidCachedEditorData && cachedContent) {
          console.log('[DocumentEditor] Using cached markdown content');
          setCurrentTitle(documentTitle || '');
          isInitialLoadRef.current = true;
          editor.setDocument('markdown', cachedContent);
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 500);
          return;
        }

        // Otherwise, fetch full content from API
        console.log('[DocumentEditor] Fetching from API');
        documentService
          .getDocumentById(documentId)
          .then((doc) => {
            if (doc) {
              setCurrentTitle(doc.title || doc.filename || '');
              // Load emoji from metadata
              if (doc.metadata?.emoji) {
                setCurrentEmoji(doc.metadata.emoji);
              }

              console.log('[DocumentEditor] Fetched doc.editorData:', {
                editorDataPreview: doc.editorData
                  ? JSON.stringify(doc.editorData).slice(0, 100)
                  : null,
                editorDataType: typeof doc.editorData,
                hasContent: !!doc.content,
                hasEditorData: !!doc.editorData,
              });

              // Check if editorData is empty or just an empty object
              const hasValidEditorData =
                doc.editorData &&
                typeof doc.editorData === 'object' &&
                Object.keys(doc.editorData).length > 0;

              // If no valid editorData but has content, use markdown format
              if (!hasValidEditorData && doc.content) {
                console.log('[DocumentEditor] Using markdown format for content');
                isInitialLoadRef.current = true;
                editor.setDocument('markdown', doc.content);
                setTimeout(() => {
                  isInitialLoadRef.current = false;
                }, 500);
              } else if (hasValidEditorData) {
                isInitialLoadRef.current = true;
                editor.setDocument('json', doc.editorData);
                setTimeout(() => {
                  isInitialLoadRef.current = false;
                }, 500);
              } else {
                // No valid content, reset flag
                isInitialLoadRef.current = false;
              }
            }
          })
          .catch((error) => {
            console.error('[DocumentEditor] Failed to load document:', error);
            // Reset flag on error
            isInitialLoadRef.current = false;
          });
      } else {
        // Reset flag if no documentId or editor
        isInitialLoadRef.current = false;
      }
      // IMPORTANT: Only re-run when documentId changes to prevent editor blur during auto-save.
      // cachedEditorData and cachedContent are intentionally excluded from dependencies
      // because they update after save, which would cause unnecessary re-initialization.
    }, [documentId]);

    // Auto-save function
    const performSave = useCallback(async () => {
      if (!editor) return;

      const editorData = editor.getDocument('json');
      const textContent = (editor.getDocument('markdown') as unknown as string) || '';

      // Don't save if content is empty
      if (!textContent || textContent.trim() === '') {
        return;
      }

      setSaveStatus('saving');

      console.log('emoji', currentEmoji);

      try {
        if (currentDocId && !currentDocId.startsWith('temp-document-')) {
          // Update existing document with optimistic update (including metadata for emoji)
          await updateDocumentOptimistically(currentDocId, {
            content: textContent,
            editorData: structuredClone(editorData),
            metadata: currentEmoji
              ? {
                  emoji: currentEmoji,
                }
              : {
                  emoji: undefined, // Explicitly set to undefined to remove emoji
                },
            name: currentTitle,
            updatedAt: new Date(),
          });
        } else {
          // Create new document (either no ID or temp ID)
          const now = Date.now();
          const timestamp = new Date(now).toLocaleString('en-US', {
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          const title = currentTitle || `Document - ${timestamp}`;

          const newDoc = await documentService.createNote({
            content: textContent,
            editorData: JSON.stringify(editorData),
            fileType: 'custom/note',
            knowledgeBaseId,
            metadata: currentEmoji
              ? {
                  createdAt: now,
                  emoji: currentEmoji,
                }
              : {
                  createdAt: now,
                },
            title,
          });

          // Create the real document object for optimistic update
          const realDocument = {
            chunkCount: null,
            chunkingError: null,
            chunkingStatus: null,
            content: textContent,
            createdAt: new Date(now),
            editorData: structuredClone(editorData),
            embeddingError: null,
            embeddingStatus: null,
            fileType: 'custom/note' as const,
            finishEmbedding: false,
            id: newDoc.id,
            name: title,
            size: textContent.length,
            sourceType: 'document' as const,
            updatedAt: new Date(now),
            url: '',
          };

          // Replace temp document with real document (smooth UX, no flicker)
          if (currentDocId?.startsWith('temp-document-')) {
            replaceTempDocumentWithReal(currentDocId, realDocument);
          }

          // Update state and notify parent
          setCurrentDocId(newDoc.id);
          onDocumentIdChange?.(newDoc.id);

          // Refresh in background to sync with server
          refreshFileList();
        }

        setSaveStatus('saved');

        onSave?.();
      } catch (error) {
        console.error('Failed to save document:', error);
        setSaveStatus('idle');
      }
    }, [
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
    ]);

    // Handle content change - auto-save after debounce (with skip initial load)
    const handleContentChangeInternal = useCallback(() => {
      // Skip if we're in the initial load phase
      if (isInitialLoadRef.current) {
        console.log('[DocumentEditor] Skipping onChange during initial load');
        return;
      }

      console.log('[DocumentEditor] Content changed, triggering auto-save');
      performSave();
    }, [performSave]);

    const { run: handleContentChange } = useDebounceFn(handleContentChangeInternal, {
      wait: SAVE_THROTTLE_TIME,
    });

    // Debounced save for title/emoji changes (no initial load check needed)
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
        editor?.cleanDocument();
      };
    }, [editor]);

    const toolbarItems: ChatInputActionsProps['items'] = useMemo(
      () =>
        [
          {
            active: editorState.isBold,
            icon: BoldIcon,
            key: 'bold',
            label: t('typobar.bold', { ns: 'editor' }),
            onClick: editorState.bold,
            tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.Bold).keys },
          },
          {
            active: editorState.isItalic,
            icon: ItalicIcon,
            key: 'italic',
            label: t('typobar.italic', { ns: 'editor' }),
            onClick: editorState.italic,
            tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.Italic).keys },
          },
          {
            active: editorState.isUnderline,
            icon: UnderlineIcon,
            key: 'underline',
            label: t('typobar.underline', { ns: 'editor' }),
            onClick: editorState.underline,
            tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.Underline).keys },
          },
          {
            active: editorState.isStrikethrough,
            icon: StrikethroughIcon,
            key: 'strikethrough',
            label: t('typobar.strikethrough', { ns: 'editor' }),
            onClick: editorState.strikethrough,
            tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.Strikethrough).keys },
          },
          {
            type: 'divider',
          },
          {
            icon: ListIcon,
            key: 'bulletList',
            label: t('typobar.bulletList', { ns: 'editor' }),
            onClick: editorState.bulletList,
            tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.BulletList).keys },
          },
          {
            icon: ListOrderedIcon,
            key: 'numberlist',
            label: t('typobar.numberList', { ns: 'editor' }),
            onClick: editorState.numberList,
            tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.NumberList).keys },
          },
          {
            icon: ListTodoIcon,
            key: 'tasklist',
            label: t('typobar.taskList', { ns: 'editor' }),
            onClick: editorState.checkList,
          },
          {
            type: 'divider',
          },
          {
            active: editorState.isBlockquote,
            icon: MessageSquareQuote,
            key: 'blockquote',
            label: t('typobar.blockquote', { ns: 'editor' }),
            onClick: editorState.blockquote,
          },
          {
            type: 'divider',
          },
          {
            icon: SigmaIcon,
            key: 'math',
            label: t('typobar.tex', { ns: 'editor' }),
            onClick: editorState.insertMath,
          },
          {
            active: editorState.isCode,
            icon: CodeXmlIcon,
            key: 'code',
            label: t('typobar.code', { ns: 'editor' }),
            onClick: editorState.code,
            tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.CodeInline).keys },
          },
          {
            icon: SquareDashedBottomCodeIcon,
            key: 'codeblock',
            label: t('typobar.codeblock', { ns: 'editor' }),
            onClick: editorState.codeblock,
          },
          editorState.isCodeblock && {
            children: (
              <CodeLanguageSelect
                onSelect={(value) => editorState.updateCodeblockLang(value)}
                value={editorState.codeblockLang}
              />
            ),
            disabled: !editorState.isCodeblock,
            key: 'codeblockLang',
          },
        ].filter(Boolean) as ChatInputActionsProps['items'],
      [editorState, t],
    );

    return (
      <Flexbox height={'100%'} style={{ background: theme.colorBgContainer }}>
        {/* Toolbar */}
        <ChatInputActionBar
          left={<ChatInputActions items={toolbarItems} />}
          right={
            saveStatus === 'saving' ? (
              <Flexbox align="center" direction="horizontal" gap={8}>
                <Icon icon={Loader2Icon} spin />
                <span style={{ color: theme.colorTextSecondary }}>{t('notesEditor.saving')}</span>
              </Flexbox>
            ) : null
          }
          style={{
            background: theme.colorFillQuaternary,
            borderBottom: `1px solid ${theme.colorBorderSecondary}`,
          }}
        />

        {/* Editor with title */}
        <Flexbox flex={1} style={{ overflowY: 'auto' }}>
          <Flexbox paddingBlock={36} paddingInline={48}>
            {/* Emoji and Title */}
            <Flexbox
              onMouseEnter={() => setIsHoveringTitle(true)}
              onMouseLeave={() => setIsHoveringTitle(false)}
              style={{ marginBottom: 24 }}
            >
              {/* Emoji picker above Choose Icon button */}
              {(currentEmoji || showEmojiPicker) && (
                <Flexbox style={{ marginBottom: 4 }}>
                  <EmojiPicker
                    allowDelete
                    locale={locale}
                    onChange={(emoji) => {
                      setCurrentEmoji(emoji);
                      debouncedSave();
                    }}
                    onDelete={() => {
                      setCurrentEmoji(undefined);
                      debouncedSave();
                    }}
                    size={80}
                    style={{
                      fontSize: 80,
                      transform: 'translateX(-6px)',
                    }}
                    title={t('notesEditor.emojiPicker.tooltip')}
                    value={currentEmoji}
                  />
                </Flexbox>
              )}

              {/* Choose Icon button - only shown when no emoji */}
              <Flexbox style={{ marginBottom: 12 }}>
                <Button
                  icon={<Icon icon={SmilePlus} />}
                  onClick={() => {
                    setCurrentEmoji('📄');
                    setShowEmojiPicker(true);
                  }}
                  size="small"
                  style={{
                    opacity: isHoveringTitle && !currentEmoji && !showEmojiPicker ? 1 : 0,
                    transform: 'translateX(-6px)',
                    transition: `opacity ${theme.motionDurationMid} ${theme.motionEaseInOut}`,
                    width: 'fit-content',
                  }}
                  type="text"
                >
                  Choose Icon
                </Button>
              </Flexbox>

              {/* Title Input */}
              <Flexbox align="center" direction="horizontal" gap={8}>
                <input
                  onChange={(e) => {
                    setCurrentTitle(e.target.value);
                    debouncedSave();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // Save immediately and focus on the editor
                      performSave().then(() => {
                        editor?.focus();
                      });
                    }
                  }}
                  placeholder={t('notesEditor.titlePlaceholder')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.colorText,
                    flex: 1,
                    fontSize: 40,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    outline: 'none',
                  }}
                  value={currentTitle}
                />
              </Flexbox>
            </Flexbox>

            <Editor
              className={editorClassName}
              content={''}
              editor={editor}
              onTextChange={handleContentChange}
              plugins={[
                ReactListPlugin,
                ReactCodePlugin,
                ReactCodeblockPlugin,
                ReactHRPlugin,
                ReactLinkHighlightPlugin,
                ReactTablePlugin,
                ReactMathPlugin,
              ]}
              style={{
                minHeight: '400px',
              }}
              type={'text'}
            />
          </Flexbox>
        </Flexbox>
      </Flexbox>
    );
  },
);

export default DocumentEditor;
