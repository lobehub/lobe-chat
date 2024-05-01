import { PropsWithChildren } from 'react';
import { Center } from 'react-layout-kit';

const MobileLayout = ({ children }: PropsWithChildren) => {
  return (
    <Center gap={16} style={{ height: '100%', paddingInline: 16 }}>
      {children}
    </Center>
  );
};

export default MobileLayout;
