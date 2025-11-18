'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import CategoryMenu from './CategoryMenu';
import Head from './Head';

const Menu = memo<{ id: string }>(({ id }) => {
  return (
    <Flexbox gap={16} height={'100%'} paddingInline={12} style={{ paddingTop: 12 }}>
      <Head id={id} />
      <CategoryMenu />
    </Flexbox>
  );
});

Menu.displayName = 'Menu';

export default Menu;
