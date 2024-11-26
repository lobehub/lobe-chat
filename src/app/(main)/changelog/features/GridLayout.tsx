'use client';

import { useResponsive } from 'antd-style';
import { PropsWithChildren, ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const GridLayout = memo<PropsWithChildren<{ date?: ReactNode; mobile?: boolean }>>(
  ({ mobile, children, date }) => {
    const { md } = useResponsive();

    const isMobile = mobile || !md;

    return (
      <Flexbox horizontal={!isMobile} width={'100%'} wrap={'wrap'}>
        <Flexbox flex={1} style={{ position: 'relative' }}>
          {date}
        </Flexbox>
        <Flexbox flex={3} gap={16} style={{ position: 'relative' }}>
          {children}
        </Flexbox>
        {!isMobile && <Flexbox flex={1} style={{ position: 'relative' }} />}
      </Flexbox>
    );
  },
);

export default GridLayout;
