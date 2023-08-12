import { DraggablePanel, DraggablePanelContainer } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';

import HeaderSpacing from '@/components/HeaderSpacing';
import { CHAT_SIDEBAR_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';

import Inner from './Inner';

const useStyles = createStyles(({ cx, css, token, stylish }) => ({
  drawer: cx(
    stylish.blurStrong,
    css`
      background: ${rgba(token.colorBgLayout, 0.4)};
    `,
  ),
  header: css`
    border-bottom: 1px solid ${token.colorBorder};
  `,
}));

interface SideBarProps {
  systemRole?: boolean;
}
const SideBar = memo<SideBarProps>(({ systemRole = true }) => {
  const { styles } = useStyles();
  const [showAgentSettings, toggleConfig] = useGlobalStore((s) => [
    s.preference.showChatSideBar,
    s.toggleChatSideBar,
  ]);

  return (
    <DraggablePanel
      className={styles.drawer}
      expand={showAgentSettings}
      minWidth={CHAT_SIDEBAR_WIDTH}
      onExpandChange={toggleConfig}
      placement={'right'}
    >
      <HeaderSpacing />
      <DraggablePanelContainer style={{ flex: 'none', minWidth: CHAT_SIDEBAR_WIDTH }}>
        <Inner systemRole={systemRole} />
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

export default SideBar;
