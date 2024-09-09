import { LobeChatProps } from '@lobehub/ui/brand';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { BRANDING_NAME } from '@/const/branding';

interface ProductLogoProps {
  className?: string;
  extra?: string;
  size?: number;
  type?: LobeChatProps['type'];
}

const CustomLogo = memo<ProductLogoProps>(({ size, className, type }) => {
  switch (type) {
    case 'text': {
      return (
        <Flexbox className={className} height={size}>
          {BRANDING_NAME}
        </Flexbox>
      );
    }

    case 'combine':
    case '3d':
    case 'flat':
    case 'mono': {
      return <Flexbox>{BRANDING_NAME}</Flexbox>;
    }
  }
});

export default CustomLogo;
