import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

const DesktopLayoutContainer = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();
  const [expand] = useGlobalStore((s) => [systemStatusSelectors.showSessionPanel(s)]);

  return (
    <Flexbox
      height={'100%'}
      padding={8}
      style={{ overflow: 'hidden', paddingLeft: expand ? 0 : 8, position: 'relative' }}
      width={'100%'}
    >
      <Flexbox
        height={'100%'}
        style={{
          background: theme.colorBgContainer,
          border: `1px solid ${theme.isDarkMode ? theme.colorBorderSecondary : theme.colorBorder}`,
          borderRadius: theme.borderRadius,
          overflow: 'hidden',
          position: 'relative',
        }}
        width={'100%'}
      >
        {children}
      </Flexbox>
    </Flexbox>
  );
});
export default DesktopLayoutContainer;
