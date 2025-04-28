'use client';

import { ConfigProvider, Menu, MenuProps } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';

export const ICON_SIZE = { size: '1.25em' };

const CategoryMenu = memo<MenuProps>(({ style, ...rest }) => {
  const theme = useTheme();

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemSelectedBg: theme.colorFillTertiary,
          },
        },
      }}
    >
      <Menu
        mode="inline"
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: 16,
          overflowX: 'hidden',
          overflowY: 'auto',
          width: '100%',
          ...style,
        }}
        {...rest}
      />
    </ConfigProvider>
  );
});

export default CategoryMenu;
