'use client';

import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Agent from './Agent';
import Nav from './Nav';

const HeaderInfo = memo<PropsWithChildren>(() => {
  return (
    <Flexbox gap={8} paddingBlock={8} paddingInline={8}>
      <Agent />
      <Nav />
    </Flexbox>
  );
});

export default HeaderInfo;
