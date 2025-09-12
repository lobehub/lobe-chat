import React from 'react';

import { Button, Space } from '@/components';

const DangerDemo = () => {
  return (
    <Space size={[8, 16]} wrap>
      <Button danger onPress={() => console.log('Danger Primary')} type="primary">
        Primary
      </Button>

      <Button danger onPress={() => console.log('Danger Default')} type="default">
        Default
      </Button>

      <Button danger onPress={() => console.log('Danger Dashed')} type="dashed">
        Dashed
      </Button>

      <Button danger onPress={() => console.log('Danger Text')} type="text">
        Text
      </Button>

      <Button danger onPress={() => console.log('Danger Link')} type="link">
        Link
      </Button>
    </Space>
  );
};

export default DangerDemo;
