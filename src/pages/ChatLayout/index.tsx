import { ActionIcon, Logo, SideNav } from '@lobehub/ui';
import { createStyles, useResponsive } from 'antd-style';
import { Album, MessageSquare, Settings2 } from 'lucide-react';
import { ReactNode, memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { useSettings } from '@/store/settings';
import { Sessions } from './SessionList';

export const useStyles = createStyles(({ css }) => ({
  grid: css`
    display: grid;
    grid-template-areas: 'sidebar session main';
    grid-template-columns: 64px var(--session-width) 1fr;
    grid-template-rows: 100vh;

    width: 100%;
  `,
}));

interface ChatLayoutProps {
  children: ReactNode;
}

const ChatLayout = ({ children }: ChatLayoutProps) => {
  const { mobile } = useResponsive();
  const { styles } = useStyles();
  const [sessionsWidth, tab, setTab] = useSettings(
    (s) => [s.sessionsWidth, s.sidebarKey, s.switchSideBar],
    shallow,
  );

  useEffect(() => {
    useSettings.persist.rehydrate();
    useSettings.setState({ sidebarKey: 'chat' });
  }, []);

  const ChatContent = (
    <Flexbox flex={1} gap={24}>
      {children}
    </Flexbox>
  );

  return mobile ? (
    ChatContent
  ) : (
    <div
      id={'ChatLayout'}
      className={styles.grid}
      style={{ '--session-width': `${sessionsWidth}px` } as any}
    >
      <SideNav
        avatar={<Logo size={40} />}
        topActions={
          <>
            <ActionIcon
              icon={MessageSquare}
              size="large"
              active={tab === 'chat'}
              onClick={() => setTab('chat')}
            />
            <ActionIcon
              icon={Album}
              size="large"
              active={tab === 'market'}
              onClick={() => setTab('market')}
            />
          </>
        }
        bottomActions={
          <>
            <ActionIcon icon={Settings2} />
          </>
        }
        style={{ gridArea: 'sidebar' }}
      />

      <Flexbox style={{ gridArea: 'session' }}>
        <Sessions />
      </Flexbox>

      <Flexbox flex={1} align={'center'} style={{ gridArea: 'main', overflowY: 'scroll' }}>
        {ChatContent}
      </Flexbox>
    </div>
  );
};

export default memo(ChatLayout);
