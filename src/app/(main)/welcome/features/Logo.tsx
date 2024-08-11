'use client';

import { memo } from 'react';
import { Center } from 'react-layout-kit';
import Image from 'next/image';

const LogoThree = () => (
  <Image
    alt="Logo Three"
    height={240} // Đặt chiều cao
    src="https://github.com/user-attachments/assets/aa547c58-6045-4b9f-9c1b-bef3ea3536a8"
    width={240} // Đặt chiều rộng
  />
);

const LogoSpline = () => (
  <Image
    alt="Logo Spline"
    height={482} // Đặt chiều cao
    src="https://github.com/user-attachments/assets/aa547c58-6045-4b9f-9c1b-bef3ea3536a8"
    width={976} // Đặt chiều rộng
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
