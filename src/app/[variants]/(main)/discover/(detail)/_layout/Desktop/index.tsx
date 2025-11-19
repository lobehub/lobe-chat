'use client';

import { memo } from 'react';
import { Outlet } from 'react-router-dom';
import { Flexbox } from 'react-layout-kit';

import { SCROLL_PARENT_ID } from '../../../features/const';
import Footer from '@/features/Setting/Footer';

const MAX_WIDTH = 1440;

/**
 * Desktop Discover Detail Layout
 * Layout for detail pages (assistant, model, provider, mcp details)
 */
const DesktopDiscoverDetailLayout = memo(() => {
  return (
    <Flexbox
      align={'center'}
      flex={1}
      id={SCROLL_PARENT_ID}
      padding={24}
      style={{ overflowX: 'hidden', overflowY: 'auto', position: 'static' }}
      width={'100%'}
    >
      <Flexbox gap={24} style={{ maxWidth: MAX_WIDTH, minHeight: '100%' }} width={'100%'}>
        <Outlet />
        <div />
        <Footer />
      </Flexbox>
    </Flexbox>
  );
});

DesktopDiscoverDetailLayout.displayName = 'DesktopDiscoverDetailLayout';


export default DesktopDiscoverDetailLayout;