'use client';

import {
  HotkeyEnum,
  IEditor,
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
  useEditorState,
} from '@lobehub/editor/react';
import { Modal } from '@lobehub/ui';
import { css, cx, useTheme } from 'antd-style';
import {
  BoldIcon,
  CodeXmlIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  MessageSquareQuote,
  SigmaIcon,
  SquareDashedBottomCodeIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { message } from '@/components/AntdStaticMethods';
import { documentService } from '@/services/document';
import { useFileStore } from '@/store/file';

const editorClassName = cx(css`
  p {
    margin-block-end: 0;
  }
`);

interface NoteEditorModalProps {
  documentId?: string;
  knowledgeBaseId?: string;
  onClose: () => void;
  open: boolean;
}

const NoteEditorModal = memo<NoteEditorModalProps>(
  ({ open, onClose, documentId, knowledgeBaseId }) => {
    const { t } = useTranslation(['file', 'editor']);
    const theme = useTheme();
    const [editor, setEditor] = useState<IEditor | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const editorState = useEditorState(editor);
    const refreshFileList = useFileStore((s) => s.refreshFileList);
    const isEditMode = !!documentId;

    // Load document content when editing
    useEffect(() => {
      if (!open || !documentId || !editor) return;

      // Always fetch full content from API when editing
      setIsLoadingContent(true);
      documentService
        .getDocumentById(documentId)
        .then((doc) => {
          if (doc && doc.content) {
            setNoteTitle(doc.title || doc.filename || '');
            console.log('doc.content', doc.content);
            // Parse the content as JSON and set it to the editor
            try {
              const editorData = JSON.parse(doc.content);
              editor.setDocument('json', editorData);
            } catch (error) {
              console.error('Failed to parse editor content as JSON:', error);
              // If it's not JSON, it might be old markdown format, set as markdown
              try {
                editor.setDocument('markdown', doc.content);
              } catch (e) {
                console.error('Failed to set editor content:', e);
              }
            }
          }
        })
        .catch((error) => {
          console.error('Failed to load document:', error);
          message.error(t('header.newNoteDialog.loadError', { ns: 'file' }));
        })
        .finally(() => {
          setIsLoadingContent(false);
        });
    }, [open, documentId, editor, t]);

    const handleClose = () => {
      // Clean up editor state
      editor?.cleanDocument();
      setNoteTitle('');
      onClose();
    };

    const handleSave = async () => {
      if (!editor || isSaving) return;

      // Get editor content as JSON (native format)
      const editorData = editor.getDocument('json');
      const content = JSON.stringify(editorData);

      // Check if editor is empty by getting text content
      const textContent = (editor.getDocument('text') as unknown as string) || '';
      if (!textContent || textContent.trim() === '') {
        message.warning(t('header.newNoteDialog.emptyContent', { ns: 'file' }));
        return;
      }

      setIsSaving(true);

      try {
        if (isEditMode) {
          // Update existing note
          await documentService.updateDocument({
            content,
            id: documentId,
            title: noteTitle,
          });
          message.success(t('header.newNoteDialog.updateSuccess', { ns: 'file' }));
        } else {
          // Create new note
          const now = Date.now();
          const timestamp = new Date(now).toLocaleString('en-US', {
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          const title = noteTitle || `Note - ${timestamp}`;

          await documentService.createNote({
            content,
            fileType: 'custom/note',
            knowledgeBaseId,
            metadata: {
              createdAt: now,
            },
            title,
          });

          message.success(t('header.newNoteDialog.saveSuccess', { ns: 'file' }));
          editor.cleanDocument();
        }

        onClose();
        await refreshFileList();
      } catch (error) {
        console.error('Failed to save note:', error);
        message.error(t('header.newNoteDialog.saveError', { ns: 'file' }));
      } finally {
        setIsSaving(false);
      }
    };

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
      <Modal
        okButtonProps={{ loading: isSaving }}
        okText={t('header.newNoteDialog.save')}
        onCancel={handleClose}
        onOk={handleSave}
        open={open}
        title={isEditMode ? t('header.newNoteDialog.editTitle') : t('header.newNoteDialog.title')}
        width={800}
      >
        <Flexbox gap={0}>
          <ChatInputActionBar
            left={<ChatInputActions items={toolbarItems} />}
            style={{
              background: theme.colorFillQuaternary,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          />
          <Flexbox padding={16}>
            {isLoadingContent ? (
              <div style={{ minHeight: 400, padding: 16 }}>
                {t('header.newNoteDialog.loading', { ns: 'file' })}
              </div>
            ) : (
              <Editor
                autoFocus
                className={editorClassName}
                content={''}
                editor={editor}
                onInit={(editor) => setEditor(editor)}
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
                  minHeight: 400,
                }}
                type={'text'}
                variant={'chat'}
              />
            )}
          </Flexbox>
        </Flexbox>
      </Modal>
    );
  },
);

export default NoteEditorModal;
