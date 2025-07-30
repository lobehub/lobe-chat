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

const BlockDemo = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <Button block onPress={() => console.log('Block Primary clicked')} type="primary">
        Block Primary Button
      </Button>

      <Button block onPress={() => console.log('Block Default clicked')} type="default">
        Block Default Button
      </Button>

      <Button block onPress={() => console.log('Block Text clicked')} type="text">
        Block Text Button
      </Button>

      <Button block onPress={() => console.log('Block Large clicked')} size="large" type="primary">
        Block Large Button
      </Button>
    </View>
  );
};

export default BlockDemo;
