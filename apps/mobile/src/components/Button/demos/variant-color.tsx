import React from 'react';
import { View } from 'react-native';

import Button from '../index';
import type { ButtonColor } from '../style';
import { createStyles } from '@/theme';

const useStyles = createStyles((token) => ({
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
  },
}));

const colors: ButtonColor[] = ['default', 'primary', 'danger', 'magenta', 'purple', 'cyan'];

const VariantColorDemo = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      {colors.map((c) => (
        <View key={c} style={styles.row}>
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
        </View>
      ))}
    </View>
  );
};

export default VariantColorDemo;
