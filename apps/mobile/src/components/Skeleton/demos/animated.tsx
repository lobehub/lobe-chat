import { Button, Flexbox, Skeleton, Text } from '@lobehub/ui-rn';
import { useState } from 'react';

const AnimatedDemo = () => {
  const [animated, setAnimated] = useState(true);

  return (
    <Flexbox gap={16}>
      <Button onPress={() => setAnimated(!animated)} type="primary">
        {animated ? 'Disable Animation' : 'Enable Animation'}
      </Button>

      <Text strong>{animated ? 'With Animation' : 'Without Animation'}</Text>
      <Skeleton animated={animated} />

      <Text strong>Large Avatar</Text>
      <Skeleton animated={animated} avatar={{ size: 80 }} />

      <Text strong>Complex Layout</Text>
      <Skeleton
        animated={animated}
        avatar={{ shape: 'square', size: 60 }}
        paragraph={{ rows: 4, width: ['100%', '95%', '85%', '60%'] }}
        title={{ width: '80%' }}
      />

      <Text strong>Side-by-Side Comparison</Text>
      <Flexbox gap={16} horizontal>
        <Flexbox flex={1} gap={8}>
          <Text type="secondary">Static</Text>
          <Skeleton animated={false} avatar={{ size: 40 }} paragraph={{ rows: 2 }} />
        </Flexbox>
        <Flexbox flex={1} gap={8}>
          <Text type="secondary">Animated</Text>
          <Skeleton animated={true} avatar={{ size: 40 }} paragraph={{ rows: 2 }} />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};

export default AnimatedDemo;
