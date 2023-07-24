import { DraggablePanel, DraggablePanelContainer } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { shallow } from 'zustand/shallow';

import HeaderSpacing from '@/components/HeaderSpacing';
import { CHAT_SIDEBAR_WIDTH } from '@/const/layoutTokens';
import { useSessionStore } from '@/store/session';

import SideBar from './SideBar';

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

const Config = () => {
  const { styles } = useStyles();
  const [showAgentSettings, toggleConfig] = useSessionStore(
    (s) => [s.showAgentSettings, s.toggleConfig],
    shallow,
  );

  return (
    <DraggablePanel
      className={styles.drawer}
      expand={showAgentSettings}
      maxWidth={CHAT_SIDEBAR_WIDTH}
      minWidth={CHAT_SIDEBAR_WIDTH}
      onExpandChange={toggleConfig}
      placement={'right'}
      resize={false}
    >
      <HeaderSpacing />
      <DraggablePanelContainer style={{ flex: 'none', minWidth: CHAT_SIDEBAR_WIDTH }}>
        <SideBar />
      </DraggablePanelContainer>
    </DraggablePanel>
  );
};

export default Config;
