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
import { Button, Modal } from '@lobehub/ui';
import { css, cx, useTheme } from 'antd-style';
import {
  BoldIcon,
  CodeXmlIcon,
  FilePenLine,
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
import { useMemo, useState } from 'react';
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

const NewNoteButton = ({ knowledgeBaseId }: { knowledgeBaseId?: string }) => {
  const { t } = useTranslation(['file', 'editor']);
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editor, setEditor] = useState<IEditor | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const editorState = useEditorState(editor);
  const refreshFileList = useFileStore((s) => s.refreshFileList);

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    // Just close the dialog, keep the content in editor (draft persisted in memory)
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (!editor || isSaving) return;

    // Get editor content as markdown
    const content = (editor.getDocument('markdown') as unknown as string) || '';

    if (!content || content.trim() === '') {
      message.warning(t('header.newNoteDialog.emptyContent', { ns: 'file' }));
      return;
    }

    setIsSaving(true);

    try {
      // Generate title with timestamp
      const now = Date.now();
      const timestamp = new Date(now).toLocaleString('en-US', {
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const title = `Note - ${timestamp}`;

      // Create note document in database
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

      // Clear draft after successful save
      editor.cleanDocument();
      setIsModalOpen(false);

      // Refresh file list to show the new note
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
    <>
      <Button icon={FilePenLine} onClick={handleOpen} type="primary">
        {t('header.newNoteButton')}
      </Button>

      <Modal
        okButtonProps={{ loading: isSaving }}
        okText={t('header.newNoteDialog.save')}
        onCancel={handleClose}
        onOk={handleSave}
        open={isModalOpen}
        title={t('header.newNoteDialog.title')}
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
            <Editor
              autoFocus
              className={editorClassName}
              content={''}
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
          </Flexbox>
        </Flexbox>
      </Modal>
    </>
  );
};

export default NewNoteButton;
