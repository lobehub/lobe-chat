'use client';

import { useResponsive, useTheme, useThemeMode } from 'antd-style';
import { ReactNode, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';

import Header from '@/app/(main)/settings/_layout/Desktop/Header';
import SideBar from '@/app/(main)/settings/_layout/Desktop/SideBar';

interface SettingLayoutProps {
  category: ReactNode;
  children: ReactNode;
  desc?: string;
  title?: string;
}

const SettingModalLayout = ({ children, category, desc, title }: SettingLayoutProps) => {
  const ref = useRef<any>(null);
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const { md = true } = useResponsive();

  return (
    <>
      {md ? (
        <SideBar
          desc={desc}
          style={{
            background: isDarkMode ? theme.colorBgContainer : theme.colorFillTertiary,
            borderColor: theme.colorFillTertiary,
          }}
          title={title}
        >
          {category}
        </SideBar>
      ) : (
        <Header getContainer={() => ref.current}>{category}</Header>
      )}
      <Flexbox
        align={'center'}
        gap={64}
        style={{
          background: isDarkMode ? theme.colorFillQuaternary : theme.colorBgElevated,
          overflowX: 'hidden',
          overflowY: 'auto',
          paddingBlock: 32,
          paddingInline: 56,
        }}
        width={'100%'}
      >
        {children}
      </Flexbox>
    </>
  );
};

SettingModalLayout.displayName = 'SettingModalLayout';

export default SettingModalLayout;
