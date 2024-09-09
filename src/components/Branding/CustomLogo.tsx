import { LobeChatProps } from '@lobehub/ui/brand';
import Image from 'next/image';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { BRANDING_LOGO_URL, BRANDING_NAME } from '@/const/branding';

interface ProductLogoProps {
  className?: string;
  extra?: string;
  size?: number;
  type?: LobeChatProps['type'];
}

const CustomLogo = memo<ProductLogoProps>(({ size = 32, className, type }) => {
  const textNode = (
    <Flexbox
      className={className}
      height={size}
      style={{
        fontSize: size / 1.5,
        fontWeight: 'bold',
        userSelect: 'none',
      }}
    >
      {BRANDING_NAME}
    </Flexbox>
  );

  const imageNode = (
    <Image
      alt={BRANDING_NAME}
      className={className}
      height={size}
      src={BRANDING_LOGO_URL}
      unoptimized={true}
      width={size}
    />
  );
  switch (type) {
    case 'text': {
      return textNode;
    }

    case 'combine': {
      return (
        <Flexbox align={'center'} gap={4} horizontal>
          {imageNode}
          {textNode}
        </Flexbox>
      );
    }

    default:
    case 'flat':
    case 'mono':
    case '3d': {
      return (
        <Image
          alt={BRANDING_NAME}
          className={className}
          height={size}
          src={BRANDING_LOGO_URL}
          unoptimized={true}
          width={size}
        />
      );
    }
  }
});

export default CustomLogo;
