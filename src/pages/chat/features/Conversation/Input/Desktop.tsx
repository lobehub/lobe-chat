import { DraggablePanel } from '@lobehub/ui';
import { ReactNode, memo } from 'react';

import { CHAT_TEXTAREA_HEIGHT, HEADER_HEIGHT } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';

interface ChatInputDesktopLayoutProps {
  children: ReactNode;
  expand?: boolean;
}

const ChatInputDesktopLayout = memo<ChatInputDesktopLayoutProps>(({ children, expand }) => {
  const [inputHeight, updatePreference] = useGlobalStore((s) => [
    s.preference.inputHeight,
    s.updatePreference,
  ]);

  return (
    <DraggablePanel
      expandable={false}
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
      {children}
    </DraggablePanel>
  );
});

export default ChatInputDesktopLayout;
