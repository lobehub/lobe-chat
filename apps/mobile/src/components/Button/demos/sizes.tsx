import React from 'react';
import { View } from 'react-native';

import Button from '../index';
import { createStyles } from '@/theme';

const useStyles = createStyles((token) => ({
  container: {
    alignItems: 'flex-start',
    gap: token.marginSM,
    padding: token.paddingLG,
  },
}));

const SizesDemo = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <Button onPress={() => console.log('Small clicked')} size="small" type="primary">
        Small
      </Button>

      <Button onPress={() => console.log('Middle clicked')} size="middle" type="primary">
        Middle
      </Button>

      <Button onPress={() => console.log('Large clicked')} size="large" type="primary">
        Large
      </Button>
    </View>
  );
};

export default SizesDemo;
