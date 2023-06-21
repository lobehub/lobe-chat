import { ActionIcon, ChatInputArea, DraggablePanel, Icon, TokenTag } from '@lobehub/ui';
import { Archive, Eraser, Languages } from 'lucide-react';
import { memo, useState } from 'react';

import { useChatStore } from '@/store/session';
import { useSettings } from '@/store/settings';
import { Button } from 'antd';
import { NextPage } from 'next';
import { shallow } from 'zustand/shallow';

const ChatInput: NextPage = () => {
  const [expand, setExpand] = useState<boolean>(false);
  const [inputHeight] = useSettings((s) => [s.inputHeight], shallow);
  const [sendMessage] = useChatStore((s) => [s.sendMessage], shallow);

  return (
    <DraggablePanel
      expandable={false}
      fullscreen={expand}
      minHeight={200}
      placement="bottom"
      size={{ width: '100%', height: inputHeight }}
      onSizeChange={(_, size) => {
        if (!size) return;
        useSettings.setState({
          inputHeight: typeof size.height === 'string' ? parseInt(size.height) : size.height,
        });
      }}
    >
      <ChatInputArea
        actions={
          <>
            <ActionIcon icon={Languages} />
            <ActionIcon icon={Eraser} />
            <TokenTag maxValue={5000} value={1000} />
          </>
        }
        expand={expand}
        footer={<Button icon={<Icon icon={Archive} />} />}
        minHeight={200}
        onExpandChange={setExpand}
        onSend={sendMessage}
      />
    </DraggablePanel>
  );
};

export default memo(ChatInput);
