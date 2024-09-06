'use client';

import { useResponsive } from 'antd-style';
import { PropsWithChildren, ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface SettingContainerProps {
  addonAfter?: ReactNode;
  addonBefore?: ReactNode;
  fullWidth?: boolean;
}
const SettingContainer = memo<PropsWithChildren<SettingContainerProps>>(
  ({ children, addonAfter, addonBefore, fullWidth }) => {
    const { mobile = false } = useResponsive();
    return (
      <Flexbox
        align={'center'}
        height={'100%'}
        paddingBlock={mobile ? undefined : 32}
        style={{ overflowX: 'hidden', overflowY: 'auto' }}
        width={'100%'}
      >
        {addonBefore}
        <Flexbox
          gap={64}
          paddingInline={mobile ? undefined : 24}
          style={{
            maxWidth: fullWidth ? undefined : 1024,
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
