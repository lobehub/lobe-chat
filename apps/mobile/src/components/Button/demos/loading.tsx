import { Button, Space } from '@lobehub/ui-rn';
import { Upload } from 'lucide-react-native';
import { useState } from 'react';

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
        icon={<Upload />}
        loading={loadings[0]}
        onPress={() => enterLoading(0)}
        type="primary"
      >
        Click to Load
      </Button>
      <Button
        icon={<Upload />}
        loading={loadings[1]}
        onPress={() => enterLoading(1)}
        shape="circle"
        type="primary"
      />
      <Button loading={loadings[2]} onPress={() => enterLoading(2)} size="small" type="primary">
        Click to Load
      </Button>

      <Button loading type="primary">
        Primary
      </Button>
      <Button disabled loading type="primary">
        Primary Disabled
      </Button>
      <Button loading type="default">
        Solid
      </Button>
      <Button loading type="dashed">
        Dashed
      </Button>
      <Button loading type="text">
        Text
      </Button>
      <Button loading type="link">
        Link
      </Button>
    </Space>
  );
};

export default LoadingDemo;
