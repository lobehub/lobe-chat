'use client';

import { memo } from 'react';

import NavHeader from '@/features/NavHeader';

import WideScreenButton from '../../WideScreenButton';
import ShareButton from './ShareButton';
import Tags from './Tags';

const Header = memo(() => {
  return (
    <NavHeader
      left={<Tags />}
      right={
        <>
          <WideScreenButton />
          <ShareButton />
        </>
      }
    />
  );
});

export default Header;
