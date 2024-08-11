'use client';

import { memo } from 'react';
import { Center } from 'react-layout-kit';
import Image from 'next/image'; // Import the Image component

const LogoThree = () => (
  <Image
    src="https://github.com/user-attachments/assets/aa547c58-6045-4b9f-9c1b-bef3ea3536a8"
    alt="Logo Three"
    width={240} // Specify width
    height={240} // Specify height
  />
);

const LogoSpline = () => (
  <Image
    src="https://github.com/user-attachments/assets/aa547c58-6045-4b9f-9c1b-bef3ea3536a8"
    alt="Logo Spline"
    width={976} // Specify width
    height={482} // Specify height
  />
);

const Logo = memo<{ mobile?: boolean }>(({ mobile }) => {
  return mobile ? (
    <Center height={240} width={240}>
      <LogoThree />
    </Center>
  ) : (
    <Center
      style={{
        height: 'min(482px, 40vw)',
        marginBottom: '-10%',
        marginTop: '-20%',
        position: 'relative',
        width: 'min(976px, 80vw)',
      }}
    >
      <LogoSpline />
    </Center>
  );
});

export default Logo;
