'use client';

import { useTheme } from 'antd-style';
import NextTopLoader from 'nextjs-toploader';
import { memo } from 'react';

import { isDesktop } from '@/const/version';

const NProgress = memo(() => {
  const theme = useTheme();
  return (
    !isDesktop && (
      <NextTopLoader
        color={theme.colorText}
        height={2}
        shadow={false}
        showSpinner={false}
        zIndex={1000}
      />
    )
  );
});

export default NProgress;
