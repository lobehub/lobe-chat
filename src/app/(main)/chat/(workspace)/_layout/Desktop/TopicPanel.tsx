'use client';

import { DraggablePanel, DraggablePanelContainer } from '@lobehub/ui';
import { createStyles, useResponsive } from 'antd-style';
import { PropsWithChildren, memo, useEffect, useLayoutEffect, useState } from 'react';

import SafeSpacing from '@/components/SafeSpacing';
import { CHAT_SIDEBAR_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';

const useStyles = createStyles(({ css, token }) => ({
  content: css`
    display: flex;
    flex-direction: column;
    height: 100% !important;
  `,
  drawer: css`
    z-index: 10;
    background: ${token.colorBgLayout};
  `,
  header: css`
    border-bottom: 1px solid ${token.colorBorder};
  `,
}));

const TopicPanel = memo(({ children }: PropsWithChildren) => {
  const { styles } = useStyles();
  const { md = true, lg = true } = useResponsive();
  const [showAgentSettings, toggleConfig, isPreferenceInit] = useGlobalStore((s) => [
    s.preference.showChatSideBar,
    s.toggleChatSideBar,
    s.isPreferenceInit,
  ]);
  const [expand, setExpand] = useState(showAgentSettings);

  useLayoutEffect(() => {
    if (!isPreferenceInit) return;
    setExpand(showAgentSettings);
  }, [isPreferenceInit, showAgentSettings]);

  useEffect(() => {
    if (lg && showAgentSettings) setExpand(true);
    if (!lg) setExpand(false);
  }, [lg, showAgentSettings]);

  return (
    <DraggablePanel
      className={styles.drawer}
      classNames={{
        content: styles.content,
      }}
      expand={expand}
      minWidth={CHAT_SIDEBAR_WIDTH}
      mode={md ? 'fixed' : 'float'}
      onExpandChange={toggleConfig}
      placement={'right'}
      showHandlerWideArea={false}
    >
      <DraggablePanelContainer
        style={{
          flex: 'none',
          height: '100%',
          maxHeight: '100vh',
          minWidth: CHAT_SIDEBAR_WIDTH,
        }}
      >
        <SafeSpacing />
        {children}
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

export default TopicPanel;
