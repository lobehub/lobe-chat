import React, { useState } from 'react';

import { Button, Space } from '@/components';

const LoadingDemo = () => {
  const [loading, setLoading] = useState(false);

  const handleStartLoading = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Space size={[8, 16]} wrap>
      <Button color="primary" loading={loading} onPress={handleStartLoading} variant="filled">
        Click to Load
      </Button>
      <Button color="default" loading variant="solid">
        Solid
      </Button>
      <Button color="blue" loading variant="tlined">
        Outlined
      </Button>
      <Button color="purple" loading variant="dashed">
        Dashed
      </Button>
      <Button color="danger" loading variant="text">
        Text
      </Button>
      <Button color="cyan" loading variant="link">
        Link
      </Button>
    </Space>
  );
};

export default LoadingDemo;
