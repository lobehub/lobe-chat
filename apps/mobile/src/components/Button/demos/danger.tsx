import { Button, Space } from '@lobehub/ui-rn';

const DangerDemo = () => {
  return (
    <Space size={[8, 16]} wrap>
      <Button danger onPress={() => console.log('Danger Primary')} type="primary">
        Primary
      </Button>

      <Button danger onPress={() => console.log('Danger Default')}>
        Default
      </Button>

      <Button danger onPress={() => console.log('Danger Default')} variant={'filled'}>
        Filled
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
