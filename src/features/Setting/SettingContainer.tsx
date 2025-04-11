'use client';

import { useResponsive, useTheme } from 'antd-style';
import { PropsWithChildren, ReactNode, memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

interface SettingContainerProps extends FlexboxProps {
  addonAfter?: ReactNode;
  addonBefore?: ReactNode;
  maxWidth?: number;
}
const SettingContainer = memo<PropsWithChildren<SettingContainerProps>>(
  ({ maxWidth = 1024, children, addonAfter, addonBefore, style, ...rest }) => {
    const { mobile = false } = useResponsive();

    const theme = useTheme();

    return (
      <Flexbox
        align={'center'}
        height={'100%'}
        paddingBlock={mobile ? undefined : 32}
        style={{
          background: theme.colorBgContainerSecondary,
          overflowX: 'hidden',
          overflowY: 'auto',
          ...style,
        }}
        width={'100%'}
        {...rest}
      >
        {addonBefore}
        <Flexbox
          flex={1}
          gap={64}
          paddingInline={mobile ? undefined : 24}
          style={{
            maxWidth,
          }}
          width={'100%'}
        >
          {children}
        </Flexbox>
        {addonAfter}
      </Flexbox>
    );
  },
);

export default SettingContainer;
