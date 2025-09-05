'use client';

import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import { ORG_NAME } from '@/const/branding';

const BrandWatermark = memo<Omit<FlexboxProps, 'children'>>(({ style, ...rest }) => {
  return (
    <Flexbox
      align={'center'}
      dir={'ltr'}
      flex={'none'}
      gap={4}
      horizontal
      style={{ color: '#8a8a8a', fontSize: 12, ...style }}
      {...rest}
    >
      <span>Powered by</span>
      <span>{ORG_NAME}</span>
    </Flexbox>
  );
});

export default BrandWatermark;
