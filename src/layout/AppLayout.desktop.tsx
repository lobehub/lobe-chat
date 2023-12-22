import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SideBar from '@/features/SideBar';
import { useIsPWA } from '@/hooks/useIsPWA';

/**
 * 针对桌面端的布局,包括一个侧边栏和一个主内容区域
 *
 * 这是一个采用`flex`布局沿着水平方向排列的容器
 */
const AppLayoutDesktop = memo<PropsWithChildren>(({ children }) => {
  const isPWA = useIsPWA();
  const theme = useTheme();

  return (
    <Flexbox
      height={'100%'}
      horizontal
      id={'AppLayoutDesktop'}
      style={isPWA ? { borderTop: `1px solid ${theme.colorBorder}` } : {}}
      width={'100%'}
    >
      <SideBar />
      {children}
    </Flexbox>
  );
});

export default AppLayoutDesktop;
