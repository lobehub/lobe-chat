'use client';

import { memo } from 'react';

import { isCustomBranding } from '@/const/version';

import CustomLogo from './Custom';
import LobeChat from './LobeChat';

export const WelcomeLogo = memo<{ mobile?: boolean }>(({ mobile }) => {
  if (isCustomBranding) {
    return <CustomLogo mobile={mobile} />;
  }

  return <LobeChat mobile={mobile} />;
});
