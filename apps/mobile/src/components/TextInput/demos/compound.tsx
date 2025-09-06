import React from 'react';
import { View, Text } from 'react-native';

import TextInput from '../index';
import { createStyles } from '@/theme';

const useStyles = createStyles((token) => ({
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
  description: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    marginBottom: token.marginSM,
  },
  sectionTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: '600',
    marginBottom: token.marginXS,
    marginTop: token.marginMD,
  },
}));

const CompoundDemo = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>搜索输入框</Text>
      <Text style={styles.description}>内置搜索图标，returnKeyType为search</Text>
      <TextInput.Search placeholder="搜索内容..." />
      <TextInput.Search placeholder="搜索用户" />

      <Text style={styles.sectionTitle}>密码输入框</Text>
      <Text style={styles.description}>支持密码显示/隐藏切换</Text>
      <TextInput.Password placeholder="请输入密码" />
      <TextInput.Password placeholder="确认密码" />

      <Text style={styles.sectionTitle}>组合使用</Text>
      <Text style={styles.description}>常见的登录表单示例</Text>
      <TextInput.Search placeholder="搜索用户名..." />
      <TextInput.Password placeholder="输入密码" />
    </View>
  );
};

export default CompoundDemo;
