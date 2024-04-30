'use client';

import { PropsWithChildren } from 'react';

import { useIsSubSlug } from '@/hooks/useIsSubSlug';

import SubSettingHeader from './SubSettingHeader';

const MobileLayout = ({ children }: PropsWithChildren) => {
  const isSubPath = useIsSubSlug();

  if (isSubPath)
    return (
      <>
        <SubSettingHeader />
        {children}
      </>
    );

  return children;
};

export default MobileLayout;
