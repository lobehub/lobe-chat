import { useEditorState } from '@lobehub/editor/react';
import {
  ChatInputActionBar,
  ChatInputActions,
  type ChatInputActionsProps,
  CodeLanguageSelect,
} from '@lobehub/editor/react';
import { useTheme } from 'antd-style';
import {
  BoldIcon,
  CodeXmlIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MessageSquareQuote,
  SquareDashedBottomCodeIcon,
  StrikethroughIcon,
} from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatInputStore } from '@/features/ChatInput/store';

const TypoBar = memo(() => {
  const { t } = useTranslation('editor');
  const editor = useChatInputStore((s) => s.editor);
  const editorState = useEditorState(editor);
  const theme = useTheme();

  return (
    <ChatInputActionBar
      left={
        <ChatInputActions
          items={
            [
              {
                active: editorState.isBold,
                icon: BoldIcon,
                key: 'bold',
                label: t('typobar.bold'),
                onClick: editorState.bold,
              },
              {
                active: editorState.isItalic,
                icon: ItalicIcon,
                key: 'italic',
                label: t('typobar.italic'),
                onClick: editorState.italic,
              },
              // TODO: 目前 markdown 不支持 <u>
              // {
              //   active: editorState.isUnderline,
              //   icon: UnderlineIcon,
              //   key: 'underline',
              //   label: t('typobar.underline'),
              //   onClick: editorState.underline,
              // },
              {
                active: editorState.isStrikethrough,
                icon: StrikethroughIcon,
                key: 'strikethrough',
                label: t('typobar.strikethrough'),
                onClick: editorState.strikethrough,
              },
              {
                type: 'divider',
              },

              {
                icon: ListIcon,
                key: 'bulletList',
                label: t('typobar.bulletList'),
                onClick: editorState.bulletList,
              },
              {
                icon: ListOrderedIcon,
                key: 'numberlist',
                label: t('typobar.numberList'),
                onClick: editorState.numberList,
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
              },
              {
                icon: SquareDashedBottomCodeIcon,
                key: 'codeblock',
                label: t('typobar.codeblock'),
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
            ].filter(Boolean) as ChatInputActionsProps['items']
          }
          onClick={() => {
            editor?.focus();
          }}
        />
      }
      style={{
        background: theme.colorFillQuaternary,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
    />
  );
});

TypoBar.displayName = 'TypoBar';

export default TypoBar;
