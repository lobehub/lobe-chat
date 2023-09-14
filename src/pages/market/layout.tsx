import { GridBackground } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { MAX_WIDTH } from '@/const/layoutTokens';
import { useSwitchSideBarOnInit } from '@/store/global';

import AppLayout from '../../layout/AppLayout';
import Header from './features/Header';
import SideBar from './features/SideBar';

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

  useSwitchSideBarOnInit('market');

  return (
    <AppLayout>
      <Flexbox
        flex={1}
        height={'100vh'}
        id={'lobe-market-container'}
        style={{ position: 'relative' }}
      >
        <Header />
        <Flexbox flex={1} height={'calc(100vh - 64px)'} horizontal>
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
    </AppLayout>
  );
});

export default MarketLayout;
