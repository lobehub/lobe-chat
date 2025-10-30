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
  SquareDashedBottomCodeIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { documentService } from '@/services/document';
import { useFileStore } from '@/store/file';

const editorClassName = cx(css`
  p {
    margin-block-end: 0;
  }
`);

interface NoteEditorPanelProps {
  documentId?: string;
  documentTitle?: string;
  editorData?: Record<string, any> | null;
  knowledgeBaseId?: string;
  onDocumentIdChange?: (newId: string) => void;
  onSave?: () => void;
}

const NoteEditorPanel = memo<NoteEditorPanelProps>(
  ({
    documentId,
    documentTitle,
    editorData: cachedEditorData,
    knowledgeBaseId,
    onDocumentIdChange,
    onSave,
  }) => {
    const { t } = useTranslation(['file', 'editor']);
    const theme = useTheme();

    const editor = useEditor();
    const editorState = useEditorState(editor);

    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
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
          documentId,
          documentTitle,
          hasCachedEditorData: !!cachedEditorData,
          isTempNote: documentId.startsWith('temp-note-'),
        });

        // Check if this is an optimistic note from local map
        const localNote = localNoteMap.get(documentId);
        if (localNote && documentId.startsWith('temp-note-')) {
          console.log('[NoteEditorPanel] Using optimistic note from local map');
          setNoteTitle(localNote.name || 'Untitled Note');
          // Start with empty editor for new notes
          editor.cleanDocument();
          return;
        }

        // If editorData is already cached (from list), use it directly
        if (cachedEditorData) {
          console.log('[NoteEditorPanel] Using cached editorData', cachedEditorData);
          setNoteTitle(documentTitle || '');
          editor.setDocument('json', JSON.stringify(cachedEditorData));
          return;
        }

        // Otherwise, fetch full content from API
        console.log('[NoteEditorPanel] Fetching from API');
        documentService
          .getDocumentById(documentId)
          .then((doc) => {
            if (doc && doc.content) {
              setNoteTitle(doc.title || doc.filename || '');

              console.log('[NoteEditorPanel] Fetched doc.editorData:', {
                editorDataPreview: doc.editorData
                  ? JSON.stringify(doc.editorData).slice(0, 100)
                  : null,
                editorDataType: typeof doc.editorData,
                hasEditorData: !!doc.editorData,
              });

              editor.setDocument('json', doc.editorData);
            }
          })
          .catch((error) => {
            console.error('[NoteEditorPanel] Failed to load document:', error);
          });
      }
    }, [documentId, editor, cachedEditorData, documentTitle]);

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
          // Update existing note with optimistic update
          await updateNoteOptimistically(currentDocId, {
            content: textContent,
            editorData: structuredClone(editorData),
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
            metadata: {
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
      knowledgeBaseId,
      refreshFileList,
      updateNoteOptimistically,
      onSave,
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

        {/* Editor */}
        <Flexbox flex={1} paddingBlock={16} paddingInline={24} style={{ overflowY: 'auto' }}>
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
              minHeight: '100%',
            }}
            type={'text'}
          />
        </Flexbox>
      </Flexbox>
    );
  },
);

export default NoteEditorPanel;
