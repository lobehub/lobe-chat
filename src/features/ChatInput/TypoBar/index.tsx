import { useToolbarState } from '@lobehub/editor';
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
  SquareDashedBottomCodeIcon,
  StrikethroughIcon,
} from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatInput } from '../hooks/useChatInput';

const TypoBar = memo(() => {
  const { t } = useTranslation('editor');
  const { editorRef } = useChatInput();
  const toolbarState = useToolbarState(editorRef);
  const theme = useTheme();

  return (
    <ChatInputActionBar
      left={
        <ChatInputActions
          items={
            [
              {
                active: toolbarState.isBold,
                icon: BoldIcon,
                key: 'bold',
                label: t('typobar.bold'),
                onClick: toolbarState.bold,
              },
              {
                active: toolbarState.isItalic,
                icon: ItalicIcon,
                key: 'italic',
                label: t('typobar.italic'),
                onClick: toolbarState.italic,
              },
              // {
              //   active: toolbarState.isUnderline,
              //   icon: UnderlineIcon,
              //   key: 'underline',
              //   label: t('typobar.underline'),
              //   onClick: toolbarState.underline,
              // },
              {
                active: toolbarState.isStrikethrough,
                icon: StrikethroughIcon,
                key: 'strikethrough',
                label: t('typobar.strikethrough'),
                onClick: toolbarState.strikethrough,
              },
              {
                type: 'divider',
              },
              {
                icon: LinkIcon,
                key: 'link',
                label: t('typobar.link'),
                onClick: () => {
                  toolbarState.insertLink();
                },
              },
              {
                icon: ListIcon,
                key: 'bulletList',
                label: t('typobar.bulletList'),
                onClick: () => {
                  toolbarState.bulletList();
                },
              },
              {
                icon: ListOrderedIcon,
                key: 'numberlist',
                label: t('typobar.numberList'),
                onClick: () => {
                  toolbarState.numberList();
                },
              },
              {
                type: 'divider',
              },
              {
                active: toolbarState.isCode,
                icon: CodeXmlIcon,
                key: 'code',
                label: t('typobar.code'),
                onClick: toolbarState.code,
              },
              !toolbarState.isInCodeblock && {
                icon: SquareDashedBottomCodeIcon,
                key: 'codeblock',
                label: t('typobar.codeblock'),
                onClick: () => {
                  toolbarState.formatCodeblock();
                },
              },
              toolbarState.isInCodeblock && {
                children: (
                  <CodeLanguageSelect
                    onSelect={(value) => toolbarState.updateCodeblockLang(value)}
                    value={toolbarState.codeblockLang}
                  />
                ),
                disabled: !toolbarState.isInCodeblock,
                key: 'codeblockLang',
              },
            ].filter(Boolean) as ChatInputActionsProps['items']
          }
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
