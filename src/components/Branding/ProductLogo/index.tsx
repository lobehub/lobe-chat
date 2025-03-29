import { LobeHub, LobeHubProps } from '@lobehub/ui/brand';
import { memo } from 'react';

import { isCustomBranding } from '@/const/version';

import CustomLogo from './Custom';

export const ProductLogo = memo<LobeHubProps>((props) => {
  if (isCustomBranding) {
    return <CustomLogo {...props} />;
  }

  return <LobeHub {...props} />;
});
