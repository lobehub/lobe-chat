import React from 'react';
import { View, Text } from 'react-native';

import TextInput from '../index';
import { createStyles } from '@/theme';

const useStyles = createStyles((token) => ({
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
  prefixText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
  },
}));

const PrefixDemo = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <TextInput placeholder="请输入用户名" prefix={<Text style={styles.prefixText}>@</Text>} />
      <TextInput
        placeholder="请输入密码"
        prefix={<Text style={styles.prefixText}>🔒</Text>}
        secureTextEntry
      />
      <TextInput placeholder="搜索内容" prefix={<Text style={styles.prefixText}>🔍</Text>} />
    </View>
  );
};

export default PrefixDemo;
