'use client';

import { HotkeyEnum, INSERT_HEADING_COMMAND, getHotkeyById } from '@lobehub/editor';
import {
  ChatInputActions,
  type ChatInputActionsProps,
  CodeLanguageSelect,
  FloatActions,
} from '@lobehub/editor/react';
import { Block } from '@lobehub/ui';
import { createStyles, useTheme } from 'antd-style';
import {
  BoldIcon,
  BotIcon,
  CodeXmlIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  MessageSquareQuote,
  Redo2Icon,
  SigmaIcon,
  SquareDashedBottomCodeIcon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
} from 'lucide-react';
import { type CSSProperties, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { usePageEditorStore } from '../store';

interface ToolbarProps {
  className?: string;
  floating?: boolean;
  style?: CSSProperties;
}

const useStyles = createStyles(({ css, token }) => ({
  askCopilot: css`
    color: ${token.colorTextDescription};

    border-radius: 6px;
    &:hover {
      color: ${token.colorTextSecondary};
    }
  `,
}));

const TypoBar = memo<ToolbarProps>(({ floating, style, className }) => {
  const { t } = useTranslation('editor');
  const editor = usePageEditorStore((s) => s.editor);
  const editorState = usePageEditorStore((s) => s.editorState);
  const theme = useTheme();
  const { styles } = useStyles();

  const items: ChatInputActionsProps['items'] = useMemo(() => {
    if (!editorState) return [];
    const baseItems = [
      {
        active: editorState.isItalic,
        children: (
          <Block
            align="center"
            className={styles.askCopilot}
            gap={8}
            horizontal
            clickable
            variant="borderless"
            paddingInline={12}
            paddingBlock={6}
          >
            <BotIcon />
            <span>Ask Copilot</span>
          </Block>
        ),
        key: 'italic',
        label: 'Ask Copilot',
        onClick: () => {
          // TODO: Ask Copilot
        },
        tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.Italic).keys },
      },
      {
        type: 'divider',
      },
      !floating && {
        disabled: !editorState.canUndo,
        icon: Undo2Icon,
        key: 'undo',
        label: t('typobar.undo', 'Undo'),
        onClick: editorState.undo,
        tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.Undo).keys },
      },
      !floating && {
        disabled: !editorState.canRedo,
        icon: Redo2Icon,
        key: 'redo',
        label: t('typobar.redo', 'Redo'),
        onClick: editorState.redo,
        tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.Redo).keys },
      },
      !floating && {
        type: 'divider',
      },
      {
        active: editorState.isBold,
        icon: BoldIcon,
        key: 'bold',
        label: t('typobar.bold'),
        onClick: editorState.bold,
        tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.Bold).keys },
      },
      {
        active: editorState.isItalic,
        icon: ItalicIcon,
        key: 'italic',
        label: t('typobar.italic'),
        onClick: editorState.italic,
        tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.Italic).keys },
      },
      {
        active: editorState.isUnderline,
        icon: UnderlineIcon,
        key: 'underline',
        label: t('typobar.underline'),
        onClick: editorState.underline,
        tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.Underline).keys },
      },
      {
        active: editorState.isStrikethrough,
        icon: StrikethroughIcon,
        key: 'strikethrough',
        label: t('typobar.strikethrough'),
        onClick: editorState.strikethrough,
        tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.Strikethrough).keys },
      },
      {
        type: 'divider',
      },
      !floating && {
        icon: Heading1Icon,
        key: 'h1',
        label: t('slash.h1'),
        onClick: () => {
          if (editor) {
            editor.dispatchCommand(INSERT_HEADING_COMMAND, { tag: 'h1' });
          }
        },
      },
      !floating && {
        icon: Heading2Icon,
        key: 'h2',
        label: t('slash.h2'),
        onClick: () => {
          if (editor) {
            editor.dispatchCommand(INSERT_HEADING_COMMAND, { tag: 'h2' });
          }
        },
      },
      !floating && {
        icon: Heading3Icon,
        key: 'h3',
        label: t('slash.h3'),
        onClick: () => {
          if (editor) {
            editor.dispatchCommand(INSERT_HEADING_COMMAND, { tag: 'h3' });
          }
        },
      },
      !floating && {
        type: 'divider',
      },
      {
        icon: ListIcon,
        key: 'bulletList',
        label: t('typobar.bulletList'),
        onClick: editorState.bulletList,
        tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.BulletList).keys },
      },
      {
        icon: ListOrderedIcon,
        key: 'numberlist',
        label: t('typobar.numberList'),
        onClick: editorState.numberList,
        tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.NumberList).keys },
      },
      {
        icon: ListTodoIcon,
        key: 'tasklist',
        label: t('typobar.taskList'),
        onClick: editorState.checkList,
      },
      {
        type: 'divider',
      },
      {
        active: editorState.isBlockquote,
        icon: MessageSquareQuote,
        key: 'blockquote',
        label: t('typobar.blockquote'),
        onClick: editorState.blockquote,
      },
      {
        icon: LinkIcon,
        key: 'link',
        label: t('typobar.link'),
        onClick: editorState.insertLink,
        tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.Link).keys },
      },
      {
        icon: SigmaIcon,
        key: 'math',
        label: t('typobar.tex'),
        onClick: editorState.insertMath,
      },
      {
        type: 'divider',
      },
      {
        active: editorState.isCode,
        icon: CodeXmlIcon,
        key: 'code',
        label: t('typobar.code'),
        onClick: editorState.code,
        tooltipProps: { hotkey: getHotkeyById(HotkeyEnum.CodeInline).keys },
      },
      !floating && {
        icon: SquareDashedBottomCodeIcon,
        key: 'codeblock',
        label: t('typobar.codeblock'),
        onClick: editorState.codeblock,
      },
      !floating &&
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
    ];

    return baseItems.filter(Boolean) as ChatInputActionsProps['items'];
  }, [editorState, editor, t, floating]);

  if (!editorState) return null;

  // Floating toolbar - just return the actions
  if (floating) return <FloatActions className={className} items={items} style={style} />;

  // Fixed toolbar - wrap in a styled container
  return (
    <Block
      className={className}
      padding={4}
      shadow
      style={{
        background: theme.colorBgElevated,
        borderRadius: 8,
        marginBottom: 16,
        marginTop: 16,
        position: 'sticky',
        top: 12,
        zIndex: 10,
        ...style,
      }}
      variant={'outlined'}
    >
      <ChatInputActions items={items} />
    </Block>
  );
});

TypoBar.displayName = 'PageEditorToolbar';

export default TypoBar;
