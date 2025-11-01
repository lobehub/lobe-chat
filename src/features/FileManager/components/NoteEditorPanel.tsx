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
import { css, cx, useTheme } from 'antd-style';
import {
  BoldIcon,
  Check,
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
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { documentService } from '@/services/document';
import { useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';

const EmojiPicker = dynamic(() => import('@lobehub/ui/es/EmojiPicker'), { ssr: false });

const editorClassName = cx(css`
  p {
    margin-block-end: 0;
  }
`);

interface NoteEditorPanelProps {
  content?: string | null;
  documentId?: string;
  documentTitle?: string;
  editorData?: Record<string, any> | null;
  emoji?: string;
  knowledgeBaseId?: string;
  onDocumentIdChange?: (newId: string) => void;
  onSave?: () => void;
}

const NoteEditor = memo<NoteEditorPanelProps>(
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
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteEmoji, setNoteEmoji] = useState<string | undefined>(undefined);
    const [isHoveringTitle, setIsHoveringTitle] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [currentDocId, setCurrentDocId] = useState<string | undefined>(documentId);
    const refreshFileList = useFileStore((s) => s.refreshFileList);
    const updateNoteOptimistically = useFileStore((s) => s.updateNoteOptimistically);
    const localNoteMap = useFileStore((s) => s.localNoteMap);
    const replaceTempNoteWithReal = useFileStore((s) => s.replaceTempNoteWithReal);

    // Load document content when documentId changes
    useEffect(() => {
      if (documentId && editor) {
        console.log('[NoteEditorPanel] Loading content:', {
          cachedEditorDataPreview: cachedEditorData
            ? JSON.stringify(cachedEditorData).slice(0, 100)
            : null,
          cachedEditorDataType: typeof cachedEditorData,
          cachedEmoji,
          documentId,
          documentTitle,
          hasCachedEditorData: !!cachedEditorData,
          isTempNote: documentId.startsWith('temp-note-'),
        });

        // Reset emoji picker state when switching documents
        setShowEmojiPicker(false);
        // Initialize emoji from cached value
        setNoteEmoji(cachedEmoji);

        // Check if this is an optimistic note from local map
        const localNote = localNoteMap.get(documentId);
        if (localNote && documentId.startsWith('temp-note-')) {
          console.log('[NoteEditorPanel] Using optimistic note from local map');
          setNoteTitle(localNote.name || 'Untitled Note');
          // Start with empty editor for new notes
          editor.cleanDocument();
          return;
        }

        // If editorData is already cached (from list), check if it's valid
        const hasValidCachedEditorData =
          cachedEditorData &&
          typeof cachedEditorData === 'object' &&
          Object.keys(cachedEditorData).length > 0;

        console.log('[NoteEditorPanel] Cached data check:', {
          cachedContent,
          cachedEditorData,
          hasCachedContent: !!cachedContent,
          hasValidCachedEditorData,
          keys: cachedEditorData ? Object.keys(cachedEditorData) : null,
        });

        if (hasValidCachedEditorData) {
          console.log('[NoteEditorPanel] Using cached editorData', cachedEditorData);
          setNoteTitle(documentTitle || '');
          editor.setDocument('json', JSON.stringify(cachedEditorData));
          return;
        }

        // If no valid editorData but has cached content, use markdown format
        if (!hasValidCachedEditorData && cachedContent) {
          console.log('[NoteEditorPanel] Using cached markdown content');
          setNoteTitle(documentTitle || '');
          editor.setDocument('markdown', cachedContent);
          return;
        }

        // Otherwise, fetch full content from API
        console.log('[NoteEditorPanel] Fetching from API');
        documentService
          .getDocumentById(documentId)
          .then((doc) => {
            if (doc) {
              setNoteTitle(doc.title || doc.filename || '');
              // Load emoji from metadata
              if (doc.metadata?.emoji) {
                setNoteEmoji(doc.metadata.emoji);
              }

              console.log('[NoteEditorPanel] Fetched doc.editorData:', {
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
                console.log('[NoteEditorPanel] Using markdown format for content');
                editor.setDocument('markdown', doc.content);
              } else if (hasValidEditorData) {
                editor.setDocument('json', doc.editorData);
              }
            }
          })
          .catch((error) => {
            console.error('[NoteEditorPanel] Failed to load document:', error);
          });
      }
    }, [
      documentId,
      editor,
      cachedEditorData,
      cachedContent,
      documentTitle,
      cachedEmoji,
      localNoteMap,
    ]);

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

      try {
        if (currentDocId && !currentDocId.startsWith('temp-note-')) {
          // Update existing note with optimistic update (including metadata for emoji)
          await updateNoteOptimistically(currentDocId, {
            content: textContent,
            editorData: structuredClone(editorData),
            metadata: noteEmoji
              ? {
                  emoji: noteEmoji,
                }
              : {
                  emoji: undefined, // Explicitly set to undefined to remove emoji
                },
            name: noteTitle,
            updatedAt: new Date(),
          });
        } else {
          // Create new note (either no ID or temp ID)
          const now = Date.now();
          const timestamp = new Date(now).toLocaleString('en-US', {
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          const title = noteTitle || `Note - ${timestamp}`;

          const newDoc = await documentService.createNote({
            content: textContent,
            editorData: JSON.stringify(editorData),
            fileType: 'custom/note',
            knowledgeBaseId,
            metadata: noteEmoji
              ? {
                  createdAt: now,
                  emoji: noteEmoji,
                }
              : {
                  createdAt: now,
                },
            title,
          });

          // Create the real note object for optimistic update
          const realNote = {
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

          // Replace temp note with real note (smooth UX, no flicker)
          if (currentDocId?.startsWith('temp-note-')) {
            replaceTempNoteWithReal(currentDocId, realNote);
          }

          // Update state and notify parent
          setCurrentDocId(newDoc.id);
          onDocumentIdChange?.(newDoc.id);

          // Refresh in background to sync with server
          refreshFileList();
        }

        setSaveStatus('saved');
        setHasUnsavedChanges(false);

        onSave?.();
      } catch (error) {
        console.error('Failed to save note:', error);
        setSaveStatus('idle');
      }
    }, [
      editor,
      currentDocId,
      noteTitle,
      noteEmoji,
      knowledgeBaseId,
      refreshFileList,
      updateNoteOptimistically,
      onSave,
      onDocumentIdChange,
      replaceTempNoteWithReal,
    ]);

    // Handle content change - mark as unsaved
    const handleContentChange = useCallback(() => {
      setHasUnsavedChanges(true);
      setSaveStatus('idle');
    }, []);

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

    // Show Done button only if there are unsaved changes OR currently saving
    const showDoneButton = hasUnsavedChanges || saveStatus === 'saving';

    return (
      <Flexbox height={'100%'} style={{ background: theme.colorBgContainer }}>
        {/* Toolbar */}
        <ChatInputActionBar
          left={<ChatInputActions items={toolbarItems} />}
          right={
            showDoneButton ? (
              <Button
                icon={<Icon icon={saveStatus === 'saving' ? Loader2Icon : Check} />}
                loading={saveStatus === 'saving'}
                onClick={performSave}
              >
                Done
              </Button>
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
              {/* Choose Icon button - only shown when no emoji */}
              <Flexbox style={{ marginBottom: 12 }}>
                <Button
                  icon={<Icon icon={SmilePlus} />}
                  onClick={() => setShowEmojiPicker(true)}
                  style={{
                    opacity: isHoveringTitle && !noteEmoji && !showEmojiPicker ? 1 : 0,
                    transform: 'translateX(-10px)',
                    transition: `opacity ${theme.motionDurationMid} ${theme.motionEaseInOut}`,
                    width: 'fit-content',
                  }}
                  type="text"
                >
                  Choose Icon
                </Button>
              </Flexbox>

              {/* Title row with emoji at leading */}
              <Flexbox align="center" direction="horizontal" gap={8}>
                {/* Emoji picker at leading position */}
                {(noteEmoji || showEmojiPicker) && (
                  <Flexbox style={{ flexShrink: 0 }}>
                    <EmojiPicker
                      allowDelete
                      locale={locale}
                      onChange={(emoji) => {
                        setNoteEmoji(emoji);
                        setHasUnsavedChanges(true);
                      }}
                      onDelete={() => {
                        setNoteEmoji(undefined);
                        setHasUnsavedChanges(true);
                      }}
                      size={56}
                      style={{
                        fontSize: 56,
                      }}
                      title={t('notesEditor.emojiPicker.tooltip')}
                      value={noteEmoji}
                    />
                  </Flexbox>
                )}

                {/* Title Input */}
                <input
                  onChange={(e) => {
                    setNoteTitle(e.target.value);
                    setHasUnsavedChanges(true);
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
                  value={noteTitle}
                />
              </Flexbox>
            </Flexbox>

            {/* Editor Content */}
            <Editor
              className={editorClassName}
              content={''}
              editor={editor}
              onChange={handleContentChange}
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

export default NoteEditor;
