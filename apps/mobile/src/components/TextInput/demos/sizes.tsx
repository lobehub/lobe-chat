import React from 'react';
import { View } from 'react-native';

import TextInput from '../index';
import { createStyles } from '@/theme';

const useStyles = createStyles((token) => ({
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
}));

const SizesDemo = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <TextInput placeholder="Small" size="small" />
      <TextInput placeholder="Middle (默认)" size="middle" />
      <TextInput placeholder="Large" size="large" />

      <TextInput.Search placeholder="Small Search" size="small" />
      <TextInput.Search placeholder="Middle Search" size="middle" />
      <TextInput.Search placeholder="Large Search" size="large" />

      <TextInput.Password placeholder="Small Password" size="small" />
      <TextInput.Password placeholder="Middle Password" size="middle" />
      <TextInput.Password placeholder="Large Password" size="large" />
    </View>
  );
};

export default SizesDemo;
