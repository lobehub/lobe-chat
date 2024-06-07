'use client';

import { useResponsive, useTheme } from 'antd-style';
import { ReactNode, memo, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';

import Header from '@/app/(main)/settings/_layout/Desktop/Header';
import SideBar from '@/app/(main)/settings/_layout/Desktop/SideBar';

interface SettingLayoutProps {
  activeTitle?: ReactNode;
  category: ReactNode;
  children: ReactNode;
  desc?: string;
  title?: string;
}

const SettingModalLayout = memo<SettingLayoutProps>(
  ({ children, category, desc, title, activeTitle }) => {
    const ref = useRef<any>(null);
    const theme = useTheme();
    const { md = true, mobile = false } = useResponsive();

    return (
      <Flexbox horizontal={md} width={'100%'}>
        {md ? (
          <SideBar
            desc={desc}
            style={{
              background: theme.isDarkMode ? theme.colorBgContainer : theme.colorFillTertiary,
              borderColor: theme.colorFillTertiary,
            }}
            title={title}
          >
            {category}
          </SideBar>
        ) : (
          <Header getContainer={() => ref.current} title={activeTitle}>
            {category}
          </Header>
        )}
        <Flexbox
          align={'center'}
          gap={mobile ? 0 : 64}
          ref={ref}
          style={{
            background: mobile
              ? theme.colorBgContainer
              : theme.isDarkMode
                ? theme.colorFillQuaternary
                : theme.colorBgElevated,
            minHeight: '100%',
            overflowX: 'hidden',
            overflowY: 'auto',
            paddingBlock: mobile ? 0 : 40,
            paddingInline: mobile ? 0 : 56,
          }}
          width={'100%'}
        >
          {children}
        </Flexbox>
      </Flexbox>
    );
  },
);

SettingModalLayout.displayName = 'SettingModalLayout';

export default SettingModalLayout;
