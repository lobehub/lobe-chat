'use client';

import { useResponsive } from 'antd-style';
import { PropsWithChildren, ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const SettingContainer = memo<
  PropsWithChildren<{ addonAfter?: ReactNode; addonBefore?: ReactNode }>
>(({ children, addonAfter, addonBefore }) => {
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
          maxWidth: 1024,
        }}
        width={'100%'}
      >
        {children}
      </Flexbox>
      {addonAfter}
    </Flexbox>
  );
});

export default SettingContainer;
