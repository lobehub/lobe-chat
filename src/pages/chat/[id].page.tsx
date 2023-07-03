import { useSettings } from '@/store/settings';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { sessionSelectors, useChatStore } from '@/store/session';
import Conversation from './Conversation';
import Header from './Header';
import { Sessions } from './SessionList';
import Sidebar from './Sidebar';

export const useStyles = createStyles(({ css }) => ({
  grid: css`
    display: grid;
    grid-template-areas:
      'sidebar session header header'
      'sidebar session main settings'
      'sidebar session main settings';
    grid-template-columns: 64px var(--session-width) 1fr auto;
    grid-template-rows: 64px 1fr;

    width: 100%;
  `,
}));

const ChatLayout = () => {
  const [title] = useChatStore((s) => {
    const context = sessionSelectors.currentChat(s);
    return [context?.meta.title];
  }, isEqual);

  const { styles } = useStyles();
  const [sessionsWidth] = useSettings((s) => [s.sessionsWidth], shallow);

  useEffect(() => {
    useSettings.persist.rehydrate();
    useSettings.setState({ sidebarKey: 'chat' });
  }, []);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (typeof id === 'string') {
      useChatStore.setState({ activeId: id });
    }
  }, [id]);

  return (
    <>
      <Head>
        <title>{title ? `${title} - LobeChat` : 'LobeChat'}</title>
      </Head>
      <div
        id={'ChatLayout'}
        className={styles.grid}
        style={
          {
            '--session-width': `${sessionsWidth}px`,
          } as any
        }
      >
        <Sidebar />
        <Flexbox style={{ gridArea: 'session', width: sessionsWidth }}>
          <Sessions />
        </Flexbox>
        <Header />
        <Flexbox style={{ gridArea: 'main', position: 'relative', height: 'calc(100vh - 64px)' }}>
          <Conversation />
        </Flexbox>
      </div>
    </>
  );
};

export default memo(ChatLayout);
