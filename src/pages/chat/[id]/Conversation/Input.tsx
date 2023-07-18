import { ActionIcon, ChatInputArea, DraggablePanel, Icon, TokenTag } from '@lobehub/ui';
import { Button } from 'antd';
import { encode } from 'gpt-tokenizer';
import { Archive, Eraser, Languages } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { CHAT_TEXTAREA_HEIGHT, HEADER_HEIGHT } from '@/const/layoutTokens';
import { ModelTokens } from '@/const/modelTokens';
import { agentSelectors, chatSelectors, useSessionStore } from '@/store/session';
import { useSettings } from '@/store/settings';

const ChatInput = () => {
  const [expand, setExpand] = useState<boolean>(false);
  const [text, setText] = useState('');
  const textTokenCount = useMemo(() => encode(text).length, [text]);

  const [inputHeight] = useSettings((s) => [s.inputHeight], shallow);
  const [totalToken, model, sendMessage, clearMessage] = useSessionStore(
    (s) => [
      chatSelectors.totalTokenCount(s),
      agentSelectors.currentAgentModel(s),
      s.createOrSendMsg,
      s.clearMessage,
    ],
    shallow,
  );

  return (
    <DraggablePanel
      expandable={false}
      fullscreen={expand}
      headerHeight={HEADER_HEIGHT}
      minHeight={CHAT_TEXTAREA_HEIGHT}
      onSizeChange={(_, size) => {
        if (!size) return;
        useSettings.setState({
          inputHeight: typeof size.height === 'string' ? Number.parseInt(size.height) : size.height,
        });
      }}
      placement="bottom"
      size={{ height: inputHeight, width: '100%' }}
      style={{ zIndex: 10 }}
    >
      <ChatInputArea
        actions={
          <>
            <ActionIcon icon={Languages} />
            <ActionIcon icon={Eraser} onClick={clearMessage} />
            <TokenTag maxValue={ModelTokens[model]} value={totalToken + textTokenCount} />
          </>
        }
        expand={expand}
        footer={<Button icon={<Icon icon={Archive} />} />}
        minHeight={CHAT_TEXTAREA_HEIGHT}
        onExpandChange={setExpand}
        onInputChange={setText}
        onSend={sendMessage}
      />
    </DraggablePanel>
  );
};

export default memo(ChatInput);
