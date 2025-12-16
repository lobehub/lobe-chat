'use client';

import { ChatInput, ChatInputActionBar, ChatInputProps } from '@lobehub/editor/react';
import { Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ReactNode, memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useChatInputStore } from '@/features/ChatInput/store';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { fileChatSelectors, useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import ActionBar from '../ActionBar';
import InputEditor from '../InputEditor';
import SendArea from '../SendArea';
import TypoBar from '../TypoBar';
import ContextContainer from './ContextContainer';

const useStyles = createStyles(({ css }) => ({
  container: css`
    .show-on-hover {
      opacity: 0;
    }

    &:hover {
      .show-on-hover {
        opacity: 1;
      }
    }
  `,
  footnote: css`
    font-size: 10px;
  `,
  fullscreen: css`
    position: absolute;
    z-index: 100;
    inset: 0;

    width: 100%;
    height: 100%;
    margin-block-start: 0;
  `,
  inputFullscreen: css`
    border: none;
    border-radius: 0 !important;
  `,
}));

const DesktopChatInput = memo<{
  extenHeaderContent?: ReactNode;
  inputContainerProps?: ChatInputProps;
  showFootnote?: boolean;
}>(({ showFootnote, inputContainerProps, extenHeaderContent }) => {
  const { t } = useTranslation('chat');
  const [chatInputHeight, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.chatInputHeight(s),
    s.updateSystemStatus,
  ]);
  const hasContextSelections = useFileStore(fileChatSelectors.chatContextSelectionHasItem);
  const hasFiles = useFileStore(fileChatSelectors.chatUploadFileListHasItem);
  const [slashMenuRef, expand, showTypoBar, editor, leftActions] = useChatInputStore((s) => [
    s.slashMenuRef,
    s.expand,
    s.showTypoBar,
    s.editor,
    s.leftActions,
  ]);

  const { styles, cx } = useStyles();

  const chatKey = useChatStore(chatSelectors.currentChatKey);

  useEffect(() => {
    if (editor) editor.focus();
  }, [chatKey, editor]);

  const shouldShowContextContainer =
    leftActions.flat().includes('fileUpload') || hasContextSelections || hasFiles;
  const contextContainerNode = shouldShowContextContainer && <ContextContainer />;

  return (
    <Flexbox
      className={cx(styles.container, expand && styles.fullscreen)}
      gap={8}
      paddingBlock={expand ? 0 : showFootnote ? '0 12px' : '0 16px'}
    >
      <ChatInput
        defaultHeight={chatInputHeight || 32}
        footer={
          <ChatInputActionBar
            left={<ActionBar />}
            right={<SendArea />}
            style={{
              paddingRight: 8,
            }}
          />
        }
        fullscreen={expand}
        header={
          <Flexbox gap={0}>
            {extenHeaderContent}
            {showTypoBar && <TypoBar />}
            {contextContainerNode}
          </Flexbox>
        }
        maxHeight={320}
        minHeight={36}
        onSizeChange={(height) => {
          updateSystemStatus({ chatInputHeight: height });
        }}
        resize={true}
        slashMenuRef={slashMenuRef}
        {...inputContainerProps}
        className={cx(expand && styles.inputFullscreen, inputContainerProps?.className)}
      >
        <InputEditor />
      </ChatInput>
      {showFootnote && !expand && (
        <Center style={{ pointerEvents: 'none', zIndex: 100 }}>
          <Text className={styles.footnote} type={'secondary'}>
            {t('input.disclaimer')}
          </Text>
        </Center>
      )}
    </Flexbox>
  );
});

DesktopChatInput.displayName = 'DesktopChatInput';

export default DesktopChatInput;
