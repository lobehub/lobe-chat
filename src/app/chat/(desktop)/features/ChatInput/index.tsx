import { ActionIcon, DraggablePanel } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Maximize2, Minimize2 } from 'lucide-react';
import { memo, useState } from 'react';

import Footer from '@/app/chat/(desktop)/features/ChatInput/Footer';
import ActionBar from '@/app/chat/features/ChatInput/ActionBar';
import { CHAT_TEXTAREA_HEIGHT, HEADER_HEIGHT } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';

import InputArea from './InputArea';

const useStyles = createStyles(({ css }) => {
  return {
    container: css`
      position: relative;

      display: flex;
      flex-direction: column;
      gap: 8px;

      height: 100%;
      padding: 12px 0 16px;
    `,
  };
});

const ChatInputDesktopLayout = memo(() => {
  const { styles } = useStyles();
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
      <section className={styles.container} style={{ minHeight: CHAT_TEXTAREA_HEIGHT }}>
        <ActionBar
          rightAreaEndRender={
            <ActionIcon
              icon={expand ? Minimize2 : Maximize2}
              onClick={() => {
                setExpand(!expand);
              }}
            />
          }
        />
        <InputArea />
        <Footer />
      </section>
    </DraggablePanel>
  );
});

export default ChatInputDesktopLayout;
