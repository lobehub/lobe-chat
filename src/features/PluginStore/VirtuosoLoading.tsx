import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Loader2Icon } from 'lucide-react';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

const VirtuosoLoading = memo(() => {
  const theme = useTheme();
  return (
    <Center padding={16}>
      <Icon color={theme.colorTextDescription} icon={Loader2Icon} spin />
    </Center>
  );
});

export default VirtuosoLoading;
