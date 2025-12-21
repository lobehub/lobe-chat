import { useTheme } from 'antd-style';
import { FC, PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import { isDesktop } from '@/const/version';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

const DesktopLayoutContainer: FC<PropsWithChildren> = ({ children }) => {
  const theme = useTheme();
  const [expand] = useGlobalStore((s) => [systemStatusSelectors.showLeftPanel(s)]);

  return (
    <Flexbox
      height={'100%'}
      padding={8}
      style={{
        overflow: 'hidden',
        paddingLeft: expand ? 0 : 8,
        paddingTop: isDesktop ? 0 : 8,
        position: 'relative',
      }}
      width={'100%'}
    >
      <Flexbox
        height={'100%'}
        style={{
          background: theme.colorBgContainer,
          border: `1px solid ${theme.isDarkMode ? theme.colorBorderSecondary : theme.colorBorder}`,
          borderRadius:
            // macOS 26's darwin is 25
            typeof window !== 'undefined' && (window.lobeEnv?.darwinMajorVersion ?? 0) >= 25
              ? 12
              : theme.borderRadius,
          overflow: 'hidden',
          position: 'relative',
        }}
        width={'100%'}
      >
        {children}
      </Flexbox>
    </Flexbox>
  );
};
export default DesktopLayoutContainer;
