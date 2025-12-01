'use client';

import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SideBarHeaderLayout from '@/features/NavPanel/SideBarHeaderLayout';

import Agent from './Agent';
import Nav from './Nav';

const HeaderInfo = memo<PropsWithChildren>(() => {
  return (
    <Flexbox gap={2} padding={4}>
      <SideBarHeaderLayout left={<Agent />} />
      <Nav />
    </Flexbox>
  );
});

export default HeaderInfo;
