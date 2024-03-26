'use client';

import { GridBackground } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dynamic from 'next/dynamic';
import { PropsWithChildren, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import ClientResponsiveLayout from '@/components/client/ClientResponsiveLayout';
import { MAX_WIDTH } from '@/const/layoutTokens';

import Header from './Header';

const SideBar = dynamic(() => import('./AgentDetail'));

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

const Desktop = memo<PropsWithChildren>(({ children }) => {
  const { theme, styles } = useStyles();

  return (
    <Flexbox flex={1} height={'100%'} id={'lobe-market-container'} style={{ position: 'relative' }}>
      <Header />
      <Flexbox flex={1} height={'calc(100% - 64px)'} horizontal>
        <Flexbox align={'center'} flex={1} style={{ overflowY: 'scroll', padding: 16 }}>
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
  );
});

export default ClientResponsiveLayout({ Desktop, Mobile: () => import('../Mobile') });
