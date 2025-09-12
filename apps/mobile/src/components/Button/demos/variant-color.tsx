import React from 'react';
import { View } from 'react-native';

import { Button, Space } from '@/components';
import type { ButtonColor } from '../style';

const colors: ButtonColor[] = ['default', 'primary', 'danger', 'magenta', 'purple', 'cyan'];

const VariantColorDemo = () => {
  return (
    <View>
      {colors.map((c) => (
        <Space key={c} size={[6, 16]} wrap>
          <Button color={c} size="small" variant="filled">
            Solid
          </Button>

          <Button color={c} size="small" variant="tlined">
            Outlined
          </Button>

          <Button color={c} size="small" variant="dashed">
            Dashed
          </Button>

          <Button color={c} size="small" variant="solid">
            Filled
          </Button>

          <Button color={c} size="small" variant="text">
            Text
          </Button>

          <Button color={c} size="small" variant="link">
            Link
          </Button>
        </Space>
      ))}
    </View>
  );
};

export default VariantColorDemo;
