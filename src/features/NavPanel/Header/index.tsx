'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import TogglePanelButton from '../TogglePanelButton';
import AddButton from './components/AddButton';
import Nav from './components/Nav';
import User from './components/User';

const Header = memo(() => {
  return (
    <Flexbox gap={2} padding={4}>
      <Flexbox align={'center'} horizontal justify={'space-between'} padding={2}>
        <User />
        <Flexbox
          align={'center'}
          gap={1}
          horizontal
          style={{
            overflow: 'hidden',
          }}
        >
          <TogglePanelButton />
          <AddButton />
        </Flexbox>
      </Flexbox>
      <Nav />
    </Flexbox>
  );
});

export default Header;
