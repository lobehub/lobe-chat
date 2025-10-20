import { Button, Space } from '@lobehub/ui-rn';

const BasicDemo = () => {
  return (
    <Space size={[8, 16]} wrap>
      <Button onPress={() => console.log('Primary clicked')} type="primary">
        Primary
      </Button>

      <Button onPress={() => console.log('Default clicked')}>Default</Button>

      <Button onPress={() => console.log('Default clicked')} variant={'filled'}>
        Default
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
