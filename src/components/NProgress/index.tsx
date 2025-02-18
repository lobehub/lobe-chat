'use client';

import { useTheme } from 'antd-style';
import NextTopLoader from 'nextjs-toploader';
import { memo } from 'react';

const NProgress = memo(() => {
  const theme = useTheme();
  return (
    <NextTopLoader
      color={theme.colorText}
      height={2}
      shadow={false}
      showSpinner={false}
      zIndex={1000}
    />
  );
});

export default NProgress;
