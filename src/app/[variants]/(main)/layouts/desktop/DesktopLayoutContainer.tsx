import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { isDesktop } from '@/const/version';

const DesktopLayoutContainer = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();

  if (!isDesktop) return children;

  return (
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
  );
});
export default DesktopLayoutContainer;
