import { Empty, EmptyProps } from '@lobehub/ui';
import { BrainIcon } from 'lucide-react';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

const MemoryEmpty = memo<EmptyProps>(({ ...rest }) => {
  return (
    <Center height="100%" style={{ minHeight: '70vh' }} width="100%">
      <Empty icon={BrainIcon} {...rest} />
    </Center>
  );
});

export default MemoryEmpty;
