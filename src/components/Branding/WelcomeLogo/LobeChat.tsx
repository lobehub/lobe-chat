'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

const LogoThree = dynamic(() => import('@lobehub/ui/es/LogoThree'), { ssr: false });
const LogoSpline = dynamic(() => import('@lobehub/ui/es/LogoThree/LogoSpline'), { ssr: false });

const WelcomeLogo = memo<{ mobile?: boolean }>(({ mobile }) => {
  return mobile ? (
    <Center height={240} width={240}>
      <LogoThree size={240} />
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
      <LogoSpline height={'min(482px, 40vw)'} width={'min(976px, 80vw)'} />
    </Center>
  );
});

export default WelcomeLogo;
