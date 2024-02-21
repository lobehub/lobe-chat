import { useTheme } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SideBar from '@/features/SideBar';
import { useIsPWA } from '@/hooks/useIsPWA';
import { SidebarTabKey } from '@/store/global/initialState';

interface AppLayoutDesktopProps {
  children: ReactNode;
  sidebarKey?: SidebarTabKey;
}
const AppLayoutDesktop = memo<AppLayoutDesktopProps>(({ children, sidebarKey }) => {
  const isPWA = useIsPWA();
  const theme = useTheme();

  return (

      <SideBar sidebarKey={sidebarKey} />
      {children}
    </Flexbox>
  );
});

export default AppLayoutDesktop;
