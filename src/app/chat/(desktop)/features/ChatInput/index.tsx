import { DraggablePanel } from '@lobehub/ui';
import { memo, useState } from 'react';

import { CHAT_TEXTAREA_HEIGHT, HEADER_HEIGHT } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';

import ChatInputContent from '../../../features/ChatInputContent';
import Footer from './Footer';

const ChatInputDesktopLayout = memo(() => {
  const [expand, setExpand] = useState<boolean>(false);
  const [inputHeight, updatePreference] = useGlobalStore((s) => [
    s.preference.inputHeight,
    s.updatePreference,
  ]);

  return (
    <DraggablePanel
      fullscreen={expand}
      headerHeight={HEADER_HEIGHT}
      minHeight={CHAT_TEXTAREA_HEIGHT}
      onSizeChange={(_, size) => {
        if (!size) return;

        updatePreference({
          inputHeight: typeof size.height === 'string' ? Number.parseInt(size.height) : size.height,
        });
      }}
      placement="bottom"
      size={{ height: inputHeight, width: '100%' }}
      style={{ zIndex: 10 }}
    >
      <ChatInputContent expand={expand} footer={<Footer />} onExpandChange={setExpand} />
    </DraggablePanel>
  );
});

export default ChatInputDesktopLayout;
