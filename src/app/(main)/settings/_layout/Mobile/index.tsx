'use client';

import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useIsSubSlug } from '@/hooks/useIsSubSlug';

import SubSettingHeader from './SubSettingHeader';

const MobileLayout = ({ children }: PropsWithChildren) => {
  const isSubPath = useIsSubSlug();

  if (isSubPath)
    return (
      <Flexbox height={'100%'} style={{ overflowX: 'hidden', overflowY: 'auto' }} width={'100%'}>
        <SubSettingHeader />
        {children}
      </Flexbox>
    );

  return children;
};

export default MobileLayout;
