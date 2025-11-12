import { useTheme } from 'antd-style';
import { PropsWithChildren, Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useLocation } from 'react-router-dom';

import { ReactRouterProvider } from '@/app/[variants]/(main)/context/ReactRouterContext';

import SideBar from './SideBar';

const DesktopLayoutContainer = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const pathname = location.pathname;
  const hideSideBar = pathname.startsWith('/settings');
  return (
    <ReactRouterProvider>
      <Suspense>
        {!hideSideBar && <SideBar />}
      </Suspense>
      <Flexbox
        style={{
          background: theme.colorBgLayout,
          borderInlineStart: `1px solid ${theme.colorBorderSecondary}`,
          borderStartStartRadius: !hideSideBar ? 12 : undefined,
          borderTop: `1px solid ${theme.colorBorderSecondary}`,
          overflow: 'hidden',
        }}
        width={'100%'}
      >
        {children}
      </Flexbox>
    </ReactRouterProvider>
  );
});
export default DesktopLayoutContainer;
