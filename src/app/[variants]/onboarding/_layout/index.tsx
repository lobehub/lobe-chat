'use client';

import { Text } from '@lobehub/ui';
import { Divider } from 'antd';
import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import LangButton from '@/features/User/UserPanel/LangButton';
import ThemeButton from '@/features/User/UserPanel/ThemeButton';

const OnBoardingContainer = memo(({ children }: PropsWithChildren) => {
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
        <Flexbox
          align={'center'}
          gap={8}
          horizontal
          justify={'space-between'}
          padding={16}
          width={'100%'}
        >
          <div />
          <Flexbox align={'center'} horizontal>
            <LangButton placement={'bottomRight'} size={18} />
            <Divider
              style={{
                height: 24,
              }}
              type={'vertical'}
            />
            <ThemeButton placement={'bottomRight'} size={18} />
          </Flexbox>
        </Flexbox>
        <Center height={'100%'} padding={16} width={'100%'}>
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

OnBoardingContainer.displayName = 'OnBoardingContainer';

export default OnBoardingContainer;
