import React from 'react';
import { View } from 'react-native';

import Button from '../index';
import { createStyles } from '@/mobile/theme';

const useStyles = createStyles((token) => ({
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
}));

const BasicDemo = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <Button onPress={() => console.log('Primary clicked')} type="primary">
        Primary Button
      </Button>

      <Button onPress={() => console.log('Default clicked')} type="default">
        Default Button
      </Button>

      <Button onPress={() => console.log('Text clicked')} type="text">
        Text Button
      </Button>

      <Button onPress={() => console.log('Link clicked')} type="link">
        Link Button
      </Button>
    </View>
  );
};

export default BasicDemo;
