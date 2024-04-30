'use client';

import { PropsWithChildren } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import { useIsSubSlug } from '@/hooks/useIsSubSlug';

import SubSettingHeader from './SubSettingHeader';

const MobileLayout = ({ children }: PropsWithChildren) => {
  const isSubPath = useIsSubSlug();

  if (isSubPath)
    return (
      <MobileContentLayout header={<SubSettingHeader />} withNav={false}>
        {children}
      </MobileContentLayout>
    );

  return children;
};

export default MobileLayout;
