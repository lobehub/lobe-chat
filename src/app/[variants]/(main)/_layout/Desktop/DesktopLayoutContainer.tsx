// 我将遵循您设定的规则
import { useTheme } from 'antd-style';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SideBar from './SideBar';

// 创建一个新的内部组件，专门处理依赖 pathname 的逻辑
const DesktopLayoutContainer = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();
  const pathname = usePathname();
  const hideSideBar = pathname.startsWith('/settings');
  return (
    <>
      {!hideSideBar && <SideBar />}
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
    </>
  );
});
export default DesktopLayoutContainer;
