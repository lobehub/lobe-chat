import { LobeChat, LobeChatProps } from '@lobehub/ui/brand';
import { memo } from 'react';

import { BRANDING_NAME } from '@/const/branding';

import CustomLogo from './CustomLogo';

interface ProductLogoProps {
  className?: string;
  extra?: string;
  size?: number;
  type?: LobeChatProps['type'];
}

export const ProductLogo = memo<ProductLogoProps>(({ size, className, extra, type }) => {
  if (BRANDING_NAME !== 'LobeChat') {
    return <CustomLogo className={className} extra={extra} size={size} type={type} />;
  }
  return <LobeChat className={className} extra={extra} size={size} type={type} />;
});
