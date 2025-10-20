import { Button, Flexbox, Skeleton, Text } from '@lobehub/ui-rn';
import { useState } from 'react';

const ComplexDemo = () => {
  const [loading, setLoading] = useState(true);

  return (
    <Flexbox gap={16}>
      <Button onPress={() => setLoading(!loading)} type="primary">
        {loading ? 'Show Content' : 'Show Loading'}
      </Button>

      <Text strong>User Profile Card</Text>
      <Skeleton
        avatar={{ size: 64 }}
        loading={loading}
        paragraph={{ rows: 2, width: ['90%', '70%'] }}
        title={{ width: '40%' }}
      >
        <Flexbox align="center" gap={12} horizontal>
          <Text as="h2">👤</Text>
          <Flexbox flex={1} gap={4}>
            <Text strong>John Doe</Text>
            <Text type="secondary">Software Engineer</Text>
            <Text type="secondary">San Francisco, CA</Text>
          </Flexbox>
        </Flexbox>
      </Skeleton>

      <Text strong>Article Card</Text>
      <Skeleton
        avatar={{ shape: 'square', size: 48 }}
        loading={loading}
        paragraph={{ rows: 2 }}
        title={{ width: '70%' }}
      >
        <Flexbox align="flex-start" gap={12} horizontal>
          <Text as="h2">📝</Text>
          <Flexbox flex={1} gap={4}>
            <Text strong>How to Build Great Apps</Text>
            <Text type="secondary">
              Learn best practices for building performant React Native applications.
            </Text>
          </Flexbox>
        </Flexbox>
      </Skeleton>
    </Flexbox>
  );
};

export default ComplexDemo;
