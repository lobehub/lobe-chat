import { GridBackground } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dynamic from 'next/dynamic';
import { PropsWithChildren, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { MAX_WIDTH } from '@/const/layoutTokens';
import AppLayoutDesktop from '@/layout/AppLayout.desktop';
import { SidebarTabKey } from '@/store/global/initialState';

import Header from './features/Header';

const SideBar = dynamic(() => import('./features/AgentDetail'));

const useStyles = createStyles(({ css }) => ({
  background: css`
    width: 80%;
    margin: -60px 0 -20px;
  `,
  title: css`
    z-index: 2;
    margin-top: 24px;
    font-size: 56px;
    font-weight: 800;
  `,
}));

const MarketLayout = memo<PropsWithChildren>(({ children }) => {
  const { theme, styles } = useStyles();

  return (
    <AppLayoutDesktop sidebarKey={SidebarTabKey.Market}>
      <Flexbox
        flex={1}
        height={'100%'}
        id={'lobe-market-container'}
        style={{ position: 'relative' }}
      >
        <Header />
        <Flexbox flex={1} height={'calc(100% - 64px)'} horizontal>
          <Flexbox align={'center'} flex={1} style={{ overflow: 'auto', padding: 16 }}>
            <SafeSpacing />

            <Flexbox gap={16} style={{ maxWidth: MAX_WIDTH, position: 'relative', width: '100%' }}>
              <Center>
                <h1 className={styles.title}>Find & Use The Best Agents</h1>
                <GridBackground
                  animation
                  className={styles.background}
                  colorFront={theme.colorText}
                  random
                />
              </Center>
              {children}
            </Flexbox>
          </Flexbox>
          <SideBar />
        </Flexbox>
      </Flexbox>
    </AppLayoutDesktop>
  );
});

export default MarketLayout;
