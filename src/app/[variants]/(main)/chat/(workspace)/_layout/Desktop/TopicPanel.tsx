'use client';

import { DraggablePanel, DraggablePanelContainer } from '@lobehub/ui';
import { createStyles, useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { PropsWithChildren, memo, useEffect, useState } from 'react';

import { CHAT_SIDEBAR_WIDTH } from '@/const/layoutTokens';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/slices/portal/selectors';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

const useStyles = createStyles(({ css, token }) => ({
  content: css`
    display: flex;
    flex-direction: column;
    height: 100% !important;
  `,
  drawer: css`
    z-index: 20;
    background: ${token.colorBgContainerSecondary};
  `,
  header: css`
    border-block-end: 1px solid ${token.colorBorderSecondary};
  `,
}));

const TopicPanel = memo(({ children }: PropsWithChildren) => {
  const { styles } = useStyles();
  const { md = true, lg = true } = useResponsive();
  const [showTopic, toggleConfig] = useGlobalStore((s) => [
    systemStatusSelectors.showChatSideBar(s),
    s.toggleChatSideBar,
  ]);
  const showPortal = useChatStore(chatPortalSelectors.showPortal);

  const [cacheExpand, setCacheExpand] = useState<boolean>(Boolean(showTopic));

  const handleExpand = (expand: boolean) => {
    if (isEqual(expand, Boolean(showTopic))) return;
    toggleConfig(expand);
    setCacheExpand(expand);
  };

  useEffect(() => {
    if (lg && cacheExpand) toggleConfig(true);
    if (!lg) toggleConfig(false);
  }, [lg, cacheExpand]);

  return (
    <DraggablePanel
      className={styles.drawer}
      classNames={{
        content: styles.content,
      }}
      expand={showTopic && !showPortal}
      minWidth={CHAT_SIDEBAR_WIDTH}
      mode={md ? 'fixed' : 'float'}
      onExpandChange={handleExpand}
      placement={'right'}
      showHandleWideArea={false}
    >
      <DraggablePanelContainer
        style={{
          flex: 'none',
          height: '100%',
          maxHeight: '100vh',
          minWidth: CHAT_SIDEBAR_WIDTH,
        }}
      >
        {children}
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

export default TopicPanel;
