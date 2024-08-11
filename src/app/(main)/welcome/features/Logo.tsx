'use client';

import { memo } from 'react';
import { Center } from 'react-layout-kit';

const LogoThree = () => (
  <img src="https://github.com/user-attachments/assets/aa547c58-6045-4b9f-9c1b-bef3ea3536a8" alt="Logo Three" />
);
const LogoSpline = () => (
  <img src="https://github.com/user-attachments/assets/aa547c58-6045-4b9f-9c1b-bef3ea3536a8" alt="Logo Spline" />
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
