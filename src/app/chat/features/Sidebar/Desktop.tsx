import { DraggablePanel, DraggablePanelContainer } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';

import SafeSpacing from '@/components/SafeSpacing';
import { CHAT_SIDEBAR_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/slices/session/selectors';

import SystemRole from './SystemRole';

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
  const [showAgentSettings, toggleConfig] = useGlobalStore((s) => [
    s.preference.showChatSideBar,
    s.toggleChatSideBar,
  ]);

  const isInbox = useSessionStore(sessionSelectors.isInboxSession);

  return (
    <DraggablePanel
      className={styles.drawer}
      classNames={{
        content: styles.content,
      }}
      expand={showAgentSettings}
      minWidth={CHAT_SIDEBAR_WIDTH}
      mode={'fixed'}
      onExpandChange={toggleConfig}
      placement={'right'}
    >
      <DraggablePanelContainer
        style={{ flex: 'none', height: '100%', minWidth: CHAT_SIDEBAR_WIDTH }}
      >
        <SafeSpacing />
        {!isInbox && <SystemRole />}
        {children}
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

export default SideBar;
