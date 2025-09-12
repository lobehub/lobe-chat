import React, { useState } from 'react';
import { View } from 'react-native';

import Button from '../index';
import { createStyles } from '@/theme';

const useStyles = createStyles((token) => ({
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginSM,
  },
}));

const LoadingDemo = () => {
  const { styles } = useStyles();
  const [loading, setLoading] = useState(false);

  const handleStartLoading = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Button color="primary" loading={loading} onPress={handleStartLoading} variant="filled">
          Click to Load
        </Button>
        <Button color="default" loading variant="solid">
          Solid
        </Button>
        <Button color="blue" loading variant="tlined">
          Outlined
        </Button>
        <Button color="purple" loading variant="dashed">
          Dashed
        </Button>
        <Button color="danger" loading variant="text">
          Text
        </Button>
        <Button color="cyan" loading variant="link">
          Link
        </Button>
      </View>
    </View>
  );
};

export default LoadingDemo;
