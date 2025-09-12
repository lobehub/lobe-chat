import React from 'react';
import { View } from 'react-native';

import Button from '../index';
import { createStyles } from '@/theme';

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
        Primary
      </Button>

      <Button block onPress={() => console.log('Block Default clicked')} type="default">
        Default
      </Button>

      <Button block onPress={() => console.log('Block Dashed clicked')} type="dashed">
        Dashed
      </Button>

      <Button block onPress={() => console.log('Block Text clicked')} type="text">
        Text
      </Button>
      <Button block onPress={() => console.log('Block Text clicked')} type="link">
        Link
      </Button>
    </View>
  );
};

export default BlockDemo;
