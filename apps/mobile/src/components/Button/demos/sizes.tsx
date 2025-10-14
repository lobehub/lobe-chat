import { Button, Space } from '@lobehub/ui-rn';

const SizesDemo = () => {
  return (
    <Space size={[8, 16]} wrap>
      <Button onPress={() => console.log('Small clicked')} size="small" type="primary">
        Small
      </Button>

      <Button onPress={() => console.log('Middle clicked')} size="middle" type="primary">
        Middle
      </Button>

      <Button onPress={() => console.log('Large clicked')} size="large" type="primary">
        Large
      </Button>
    </Space>
  );
};

export default SizesDemo;
