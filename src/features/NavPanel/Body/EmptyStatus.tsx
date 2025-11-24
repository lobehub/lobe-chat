import { Button, Text } from '@lobehub/ui';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

const EmptyStatus = memo<{ onClick: () => void; title: string }>(({ title, onClick }) => {
  return (
    <Center padding={4}>
      <Button block onClick={onClick} style={{ background: 'transparent' }} type={'dashed'}>
        <Text align={'center'} type={'secondary'}>
          {title}
        </Text>
      </Button>
    </Center>
  );
});

export default EmptyStatus;
