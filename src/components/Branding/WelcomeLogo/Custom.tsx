'use client';

import Image from 'next/image';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

import { BRANDING_LOGO_URL, BRANDING_NAME } from '@/const/branding';

const WelcomeLogo = memo<{ mobile?: boolean }>(({ mobile }) => {
  return mobile ? (
    <Center height={240} width={240}>
      <Image
        alt={BRANDING_NAME}
        height={240}
        src={BRANDING_LOGO_URL}
        unoptimized={true}
        width={240}
      />
    </Center>
  ) : (
    <Center
      style={{
        height: `min(482px, 40vw)`,
        marginBottom: '-10%',
        marginTop: '-20%',
        position: 'relative',
        width: `min(976px, 80vw)`,
      }}
    >
      <Image
        alt={BRANDING_NAME}
        height={240}
        src={BRANDING_LOGO_URL}
        unoptimized={true}
        width={240}
      />
    </Center>
  );
});

export default WelcomeLogo;
