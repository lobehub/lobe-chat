import React, { useState } from 'react';

import { Button, Space } from '@/components';
import { CirclePower } from 'lucide-react-native';

const LoadingDemo = () => {
  const [loadings, setLoadings] = useState<boolean[]>([]);

  const enterLoading = (index: number) => {
    console.log('Start loading:', index);

    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });

    setTimeout(() => {
      setLoadings((prevLoadings) => {
        const newLoadings = [...prevLoadings];
        newLoadings[index] = false;
        return newLoadings;
      });
    }, 3000);
  };

  return (
    <Space size={[8, 16]} wrap>
      <Button
        icon={<CirclePower />}
        loading={loadings[0]}
        onPress={() => enterLoading(0)}
        type="primary"
      >
        Click to Load
      </Button>
      <Button
        icon={<CirclePower />}
        loading={loadings[1]}
        onPress={() => enterLoading(1)}
        shape="circle"
        type="primary"
      />
      <Button loading={loadings[2]} onPress={() => enterLoading(2)} size="small" type="primary">
        Click to Load
      </Button>
      <Button loading onPress={() => enterLoading(2)} type="default">
        Solid
      </Button>
      <Button loading onPress={() => enterLoading(3)} type="dashed">
        Dashed
      </Button>
      <Button loading onPress={() => enterLoading(4)} type="text">
        Text
      </Button>
      <Button loading onPress={() => enterLoading(5)} type="link">
        Link
      </Button>
    </Space>
  );
};

export default LoadingDemo;
