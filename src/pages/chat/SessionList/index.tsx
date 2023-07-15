import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import FolderPanel from '@/features/FolderPanel';

import Header from './Header';
import SessionList from './List';

export const Sessions = memo(() => {
  return (
    <FolderPanel>
      <Flexbox gap={8} height={'100%'}>
        <Header />
        <SessionList />
      </Flexbox>
    </FolderPanel>
  );
});
