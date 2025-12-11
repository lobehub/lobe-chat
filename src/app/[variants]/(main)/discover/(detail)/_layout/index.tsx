'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import Footer from '@/features/Setting/Footer';
import WideScreenContainer from '@/features/WideScreenContainer';

import { MAX_WIDTH } from '../../features/const';
import Header from './Header';

/**
 * Desktop Discover Detail Layout
 * Layout for detail pages (assistant, model, provider, mcp details)
 */
const DesktopDiscoverDetailLayout = memo(() => {
  return (
    <>
      <Header />
      <Flexbox height={'100%'} style={{ overflowY: 'auto' }} width={'100%'}>
        <WideScreenContainer
          gap={32}
          minWidth={MAX_WIDTH}
          paddingBlock={16}
          style={{
            minHeight: '100%',
          }}
          wrapperStyle={{
            minHeight: '100%',
            position: 'relative',
          }}
        >
          <Outlet />
          <div style={{ flex: 1 }} />
          <Footer />
        </WideScreenContainer>
      </Flexbox>
    </>
  );
});

DesktopDiscoverDetailLayout.displayName = 'DesktopDiscoverDetailLayout';

export default DesktopDiscoverDetailLayout;
