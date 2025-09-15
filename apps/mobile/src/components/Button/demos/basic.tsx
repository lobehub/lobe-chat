import React from 'react';

import { Button, Space } from '@/components';

const BasicDemo = () => {
  return (
    <Space size={[8, 16]} wrap>
      <Button onPress={() => console.log('Primary clicked')} type="primary">
        Primary
      </Button>

      <Button onPress={() => console.log('Default clicked')} type="default">
        Default
      </Button>

      <Button onPress={() => console.log('Dashed clicked')} type="dashed">
        Dashed
      </Button>

      <Button onPress={() => console.log('Text clicked')} type="text">
        Text
      </Button>

      <Button onPress={() => console.log('Link clicked')} type="link">
        Link
      </Button>
    </Space>
  );
};

export default BasicDemo;
