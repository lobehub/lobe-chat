import { Button, Space } from '@lobehub/ui-rn';
import { View } from 'react-native';

const colors: any[] = ['default', 'primary', 'danger', 'magenta', 'purple', 'cyan'];

const VariantColorDemo = () => {
  return (
    <View>
      {colors.map((c) => (
        <Space key={c} size={[6, 16]} wrap>
          <Button color={c} size="small" variant="filled">
            Filled
          </Button>

          <Button color={c} size="small" variant="outlined">
            Outlined
          </Button>

          <Button color={c} size="small" variant="borderless">
            Borderless
          </Button>
        </Space>
      ))}
    </View>
  );
};

export default VariantColorDemo;
