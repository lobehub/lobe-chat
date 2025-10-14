import { Input, Text, createStyles } from '@lobehub/ui-rn';
import { View } from 'react-native';

const useStyles = createStyles(({ token }) => ({
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
      <Input placeholder="请输入用户名" prefix={<Text style={styles.prefixText}>@</Text>} />
      <Input
        placeholder="请输入密码"
        prefix={<Text style={styles.prefixText}>🔒</Text>}
        secureTextEntry
      />
      <Input placeholder="搜索内容" prefix={<Text style={styles.prefixText}>🔍</Text>} />
    </View>
  );
};

export default PrefixDemo;
