import { Icon } from '@lobehub/ui';
import { Loader2Icon } from 'lucide-react';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

const VirtuosoLoadingtsx = memo(() => {
  return (
    <Center padding={16}>
      <Icon icon={Loader2Icon} spin />
    </Center>
  );
});

export default VirtuosoLoadingtsx;
