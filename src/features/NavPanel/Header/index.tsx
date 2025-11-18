'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AddButton from './components/AddButton';
import Nav from './components/Nav';
import TogglePanelButton from './components/TogglePanelButton';
import User from './components/User';

interface HeaderProps {
  expand: boolean;
}

const Header = memo<HeaderProps>(({ expand }) => {
  return (
    <Flexbox gap={8} paddingBlock={8} paddingInline={8}>
      <Flexbox align={'center'} horizontal justify={'space-between'}>
        <User expand={expand} />
        {expand && (
          <Flexbox align={'center'} gap={2} horizontal>
            <TogglePanelButton />
            <AddButton />
          </Flexbox>
        )}
      </Flexbox>
      <Nav expand={expand} />
    </Flexbox>
  );
});

export default Header;
