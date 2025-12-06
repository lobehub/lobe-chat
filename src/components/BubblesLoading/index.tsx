import { LoadingDots } from '@lobehub/ui/chat';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

const BubblesLoading = memo(() => {
  const theme = useTheme();
  return (
    <Center style={{ height: 24, width: 32 }}>
      <LoadingDots color={theme.colorTextSecondary} size={12} variant={'pulse'} />
    </Center>
  );
});

export default BubblesLoading;
