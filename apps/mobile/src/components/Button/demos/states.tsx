import React, { useState } from 'react';

import { Button, Space } from '@/components';

const StatesDemo = () => {
  const [loading, setLoading] = useState(false);

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Space size={[8, 16]} wrap>
      <Button onPress={() => console.log('Normal clicked')} type="primary">
        Normal
      </Button>

      <Button disabled onPress={() => console.log('Disabled clicked')} type="primary">
        Disabled
      </Button>

      <Button loading={loading} onPress={handleLoadingClick} type="primary">
        {loading ? 'Loading...' : 'Click to Load'}
      </Button>

      <Button loading onPress={() => console.log('Always loading')} type="default">
        Always Loading
      </Button>
    </Space>
  );
};

export default StatesDemo;
