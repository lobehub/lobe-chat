'use client';

import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { TextAreaRef } from 'antd/es/input/TextArea';
import { memo, useRef, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import ActionBar from '@/features/ChatInput/ActionBar';
import { ActionKeys } from '@/features/ChatInput/ActionBar/config';
import STT from '@/features/ChatInput/STT';
import SaveTopic from '@/features/ChatInput/Topic';
import { useSendMessage } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import { useInitAgentConfig } from '../../../../_layout/useInitAgentConfig';
import Files from './Files';
import InputArea from './InputArea';
import SendButton from './Send';

const defaultLeftActions: ActionKeys[] = [
  'model',
  'fileUpload',
  'knowledgeBase',
  'history',
  'tools',
  'params',
  'mainToken',
];

const defaultRightActions: ActionKeys[] = ['clear'];

const MobileChatInput = memo(() => {
  const theme = useTheme();
  const ref = useRef<TextAreaRef>(null);
  const [expand, setExpand] = useState<boolean>(false);
  const { send: sendMessage, canSend } = useSendMessage();
  const { isLoading } = useInitAgentConfig();

  const [loading, value, onInput, onStop] = useChatStore((s) => [
    chatSelectors.isAIGenerating(s),
    s.inputMessage,
    s.updateInputMessage,
    s.stopGenerateMessage,
  ]);

  return (
    <InputArea
      expand={expand}
      onInput={onInput}
      onSend={() => {
        setExpand(false);

        sendMessage();
      }}
      ref={ref}
      setExpand={setExpand}
      style={{
        background: theme.colorBgLayout,
        top: expand ? 0 : undefined,
        width: '100%',
        zIndex: 101,
      }}
      textAreaLeftAddons={<STT mobile />}
      textAreaRightAddons={
        <SendButton disabled={!canSend} loading={loading} onSend={sendMessage} onStop={onStop} />
      }
      topAddons={
        isLoading ? (
          <Flexbox paddingInline={8}>
            <Skeleton.Button active block size={'small'} />
          </Flexbox>
        ) : (
          <>
            <Files />
            <ActionBar
              leftActions={defaultLeftActions}
              padding={'0 8px'}
              rightActions={defaultRightActions}
              rightAreaStartRender={<SaveTopic mobile />}
            />
          </>
        )
      }
      value={value}
    />
  );
});

MobileChatInput.displayName = 'MobileChatInput';

export default MobileChatInput;
