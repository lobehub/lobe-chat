'use client';

import { useTheme } from 'antd-style';
import { FC, PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

const Container: FC<PropsWithChildren> = ({ children }) => {
  const theme = useTheme();

  return (
    <Flexbox
      flex={1}
      style={{
        background: theme.colorBgContainerSecondary,
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {children}
    </Flexbox>
  );
};

Container.displayName = 'Container';

export default Container;
