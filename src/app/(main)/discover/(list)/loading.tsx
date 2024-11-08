'use client';

import { Skeleton } from 'antd';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useServerConfigStore } from '@/store/serverConfig';

import CategoryContainer from '../components/CategoryContainer';

export default memo(() => {
  const pathname = usePathname();
  const mobile = useServerConfigStore((s) => s.isMobile);
  const withoutCategory =
    pathname === '/discover' ||
    pathname === '/discover/providers' ||
    pathname === '/discover/search';

  if (mobile || withoutCategory)
    return (
      <Flexbox flex={1} gap={16}>
        <Skeleton.Button active style={{ minWidth: 150 }} />
        <Skeleton paragraph={{ rows: 16 }} style={{ marginBlock: 24 }} title={false} />
      </Flexbox>
    );

  return (
    <Flexbox gap={24} horizontal style={{ position: 'relative' }} width={'100%'}>
      <CategoryContainer>
        <Skeleton paragraph={{ rows: 10 }} title={false} />
      </CategoryContainer>
      <Flexbox flex={1} gap={16}>
        <Skeleton.Button active style={{ minWidth: 150 }} />
        <Skeleton paragraph={{ rows: 16 }} style={{ marginBlock: 24 }} title={false} />
      </Flexbox>
    </Flexbox>
  );
});
