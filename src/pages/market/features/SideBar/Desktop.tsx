import { DraggablePanel, DraggablePanelBody, DraggablePanelContainer } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';

import SafeSpacing from '@/components/SafeSpacing';
import { MARKET_SIDEBAR_WIDTH } from '@/const/layoutTokens';
import { useMarketStore } from '@/store/market';

const useStyles = createStyles(({ css, token }) => ({
  content: css`
    display: flex;
    flex-direction: column;
  `,
  drawer: css`
    background: ${token.colorBgLayout};
  `,
  header: css`
    border-bottom: 1px solid ${token.colorBorder};
  `,
}));

const SideBar = memo<{ children: ReactNode }>(({ children }) => {
  const { styles } = useStyles();
  const [showAgentSidebar, toggleConfig] = useMarketStore((s) => [
    s.showAgentSidebar,
    s.toggleMarketSideBar,
  ]);

  return (
    <DraggablePanel
      className={styles.drawer}
      classNames={{
        content: styles.content,
      }}
      expand={showAgentSidebar}
      minWidth={MARKET_SIDEBAR_WIDTH}
      mode={'fixed'}
      onExpandChange={toggleConfig}
      placement={'right'}
    >
      <DraggablePanelContainer
        style={{
          flex: 'none',
          height: '100vh',
          minWidth: MARKET_SIDEBAR_WIDTH,
        }}
      >
        <SafeSpacing />
        <DraggablePanelBody style={{ padding: 0 }}>{children}</DraggablePanelBody>
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

export default SideBar;
