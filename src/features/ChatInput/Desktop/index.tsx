'use client';

import { ChatInput, ChatInputActionBar, ChatInputProps } from '@lobehub/editor/react';
import { Center, Flexbox, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ReactNode, memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import DragUploadZone from '@/components/DragUploadZone';
import { useChatInputStore } from '@/features/ChatInput/store';
import { useModelSupportVision } from '@/hooks/useModelSupportVision';
import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { fileChatSelectors, useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import ActionBar, { type ActionToolbarProps } from '../ActionBar';
import { useAgentId } from '../hooks/useAgentId';
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

interface DesktopChatInputProps extends ActionToolbarProps {
  extenHeaderContent?: ReactNode;
  inputContainerProps?: ChatInputProps;
  showFootnote?: boolean;
}

const DesktopChatInput = memo<DesktopChatInputProps>(
  ({ showFootnote, inputContainerProps, extenHeaderContent, dropdownPlacement }) => {
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

    // Get agent info for vision support check
    const agentId = useAgentId();
    const model = useAgentStore((s) => agentByIdSelectors.getAgentModelById(agentId)(s));
    const provider = useAgentStore((s) => agentByIdSelectors.getAgentModelProviderById(agentId)(s));
    const canUploadImage = useModelSupportVision(model, provider);
    const uploadFiles = useFileStore((s) => s.uploadChatFiles);

    const handleUploadFiles = async (files: File[]) => {
      // Filter out image files if the model does not support vision
      const filteredFiles = files.filter((file) => {
        if (canUploadImage) return true;
        return !file.type.startsWith('image');
      });

      if (filteredFiles.length > 0) {
        uploadFiles(filteredFiles);
      }
    };

    useEffect(() => {
      if (editor) editor.focus();
    }, [chatKey, editor]);

    const shouldShowContextContainer =
      leftActions.flat().includes('fileUpload') || hasContextSelections || hasFiles;
    const contextContainerNode = shouldShowContextContainer && <ContextContainer />;

    return (
      <DragUploadZone onUploadFiles={handleUploadFiles}>
        <Flexbox
          className={cx(styles.container, expand && styles.fullscreen)}
          gap={8}
          paddingBlock={expand ? 0 : showFootnote ? '0 12px' : '0 16px'}
        >
          <ChatInput
            defaultHeight={chatInputHeight || 32}
            footer={
              <ChatInputActionBar
                left={<ActionBar dropdownPlacement={dropdownPlacement} />}
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
      </DragUploadZone>
    );
  },
);

DesktopChatInput.displayName = 'DesktopChatInput';

export default DesktopChatInput;
