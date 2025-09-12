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

const DangerDemo = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <Button danger onPress={() => console.log('Danger Primary')} type="primary">
        Danger Primary
      </Button>

      <Button danger onPress={() => console.log('Danger Default')} type="default">
        Danger Default
      </Button>

      <Button danger onPress={() => console.log('Danger Dashed')} type="dashed">
        Danger Dashed
      </Button>

      <Button danger onPress={() => console.log('Danger Text')} type="text">
        Danger Text
      </Button>

      <Button danger onPress={() => console.log('Danger Link')} type="link">
        Danger Link
      </Button>
    </View>
  );
};

export default DangerDemo;
