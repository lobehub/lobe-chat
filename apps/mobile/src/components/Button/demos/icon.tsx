import React from 'react';
import { ArrowRight, Check, Plus, Search } from 'lucide-react-native';

import { Button, Space } from '@/components';

const IconDemo = () => {
  return (
    <Space size={[8, 16]} wrap>
      <Button icon={<Plus />} onPress={() => console.log('Create clicked')} type="primary">
        Create
      </Button>

      <Button icon={<Search />} onPress={() => console.log('Search clicked')} type="default">
        Search
      </Button>

      <Button icon={<Check />} onPress={() => console.log('Confirm clicked')} type="text">
        Confirm
      </Button>

      <Button icon={<ArrowRight />} onPress={() => console.log('Next clicked')} type="link">
        Next
      </Button>
    </Space>
  );
};

export default IconDemo;
