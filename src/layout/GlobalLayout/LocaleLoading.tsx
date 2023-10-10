import { Icon } from '@lobehub/ui';
import { Loader2 } from 'lucide-react';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

const Loading = memo(() => (
  <div
    style={{
      backdropFilter: 'blur(3px)',
      height: '100%',
      width: '100vw',
      zIndex: 100,
    }}
  >
    <Center flex={1} gap={12} width={'100%'}>
      <Icon icon={Loader2} spin />
    </Center>
  </div>
));

export default Loading;
