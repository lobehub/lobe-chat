'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import FileTree from '@/features/ResourceManager/components/Tree';

import Head from '../_layout/Header/LibraryHead';

const Menu = memo<{ id: string }>(({ id }) => {
  return (
    <Flexbox gap={16} height={'100%'} style={{ paddingTop: 12 }}>
      <Flexbox paddingInline={12}>
        <Head id={id} />
      </Flexbox>
      <FileTree />
    </Flexbox>
  );
});

Menu.displayName = 'Menu';

export default Menu;
