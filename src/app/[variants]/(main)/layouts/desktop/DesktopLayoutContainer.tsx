import { useTheme } from 'antd-style';
import { PropsWithChildren, Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SideBar from './SideBar';

const DesktopLayoutContainer = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();

  return (
    <>
      <Suspense>
        <SideBar />
      </Suspense>
      <Flexbox
        style={{
          background: theme.colorBgLayout,
          borderInlineStart: `1px solid ${theme.colorBorderSecondary}`,
          borderStartStartRadius: 12,
          borderTop: `1px solid ${theme.colorBorderSecondary}`,
          overflow: 'hidden',
        }}
        width={'100%'}
      >
        {children}
      </Flexbox>
    </>
  );
});
export default DesktopLayoutContainer;
