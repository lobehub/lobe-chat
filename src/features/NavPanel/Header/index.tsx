'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import AddButton from './components/AddButton';
import Nav from './components/Nav';
import TogglePanelButton from './components/TogglePanelButton';
import User from './components/User';

const Header = memo(() => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  return (
    <Flexbox gap={8} paddingBlock={8} paddingInline={8}>
      <Flexbox align={'center'} horizontal justify={'space-between'}>
        <User />
        {expand && (
          <Flexbox align={'center'} gap={2} horizontal>
            <TogglePanelButton />
            <AddButton />
          </Flexbox>
        )}
      </Flexbox>
      <Nav />
    </Flexbox>
  );
});

export default Header;
