import { Input, createStyles } from '@lobehub/ui-rn';
import React from 'react';
import { View } from 'react-native';

const useStyles = createStyles(({ token }) => ({
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
}));

const BasicDemo = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <Input placeholder="请输入内容" />
      <Input defaultValue="预设值" />
    </View>
  );
};

export default BasicDemo;
