import React, { useState } from 'react';
import { View } from 'react-native';

import Button from '../index';
import { createStyles } from '@/mobile/theme';

const useStyles = createStyles((token) => ({
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
}));

const StatesDemo = () => {
  const { styles } = useStyles();
  const [loading, setLoading] = useState(false);

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Button onPress={() => console.log('Normal clicked')} type="primary">
        Normal
      </Button>

      <Button disabled onPress={() => console.log('Disabled clicked')} type="primary">
        Disabled
      </Button>

      <Button loading={loading} onPress={handleLoadingClick} type="primary">
        {loading ? 'Loading...' : 'Click to Load'}
      </Button>

      <Button loading onPress={() => console.log('Always loading')} type="default">
        Always Loading
      </Button>
    </View>
  );
};

export default StatesDemo;
