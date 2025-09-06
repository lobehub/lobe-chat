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

const BasicDemo = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <TextInput placeholder="请输入内容" />
      <TextInput defaultValue="预设值" />
    </View>
  );
};

export default BasicDemo;
