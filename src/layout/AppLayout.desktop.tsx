import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SideBar from '@/features/SideBar';
import { useIsPWA } from '@/hooks/useIsPWA';

const AppLayoutDesktop = memo<PropsWithChildren>(({ children }) => {
  const isPWA = useIsPWA();
  const theme = useTheme();

  return (
    <Flexbox
      height={'100%'}
      horizontal
      style={isPWA ? { borderTop: `1px solid ${theme.colorBorder}` } : {}}
      width={'100%'}
    >
      <SideBar />
      {children}
    </Flexbox>
  );
});

export default AppLayoutDesktop;
