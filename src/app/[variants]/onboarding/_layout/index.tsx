'use client';

import { Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { ProductLogo } from '@/components/Branding';

const OnboardingContainer = memo(({ children }: PropsWithChildren) => {
  const theme = useTheme();
  return (
    <Flexbox
      height={'100%'}
      padding={8}
      style={{
        position: 'relative',
      }}
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
        <Flexbox padding={16} width={'100%'}>
          <ProductLogo size={40} />
        </Flexbox>
        <Center flex={1} padding={16} width={'100%'}>
          {children}
        </Center>
        <Center padding={24}>
          <Text align={'center'} type={'secondary'}>
            © 2025 LobeHub, Inc. All rights reserved.
          </Text>
        </Center>
      </Flexbox>
    </Flexbox>
  );
});

OnboardingContainer.displayName = 'OnboardingContainer';

export default OnboardingContainer;
