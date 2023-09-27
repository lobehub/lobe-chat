import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SideBar from '@/features/SideBar';

const isPwa = window.matchMedia('(display-mode: standalone)').matches;

const AppLayout = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();
  return (
    <Flexbox
      horizontal
      style={isPwa ? { borderTop: `1px solid ${theme.colorBorder}` } : {}}
      width={'100%'}
    >
      <SideBar />
      {children}
    </Flexbox>
  );
});

export default AppLayout;
