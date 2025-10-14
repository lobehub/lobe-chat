import { Input, createStyles } from '@lobehub/ui-rn';
import { View } from 'react-native';

const useStyles = createStyles(({ token }) => ({
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
}));

const SizesDemo = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <Input placeholder="Small" size="small" />
      <Input placeholder="Middle (默认)" size="middle" />
      <Input placeholder="Large" size="large" />

      <Input.Search placeholder="Small Search" size="small" />
      <Input.Search placeholder="Middle Search" size="middle" />
      <Input.Search placeholder="Large Search" size="large" />

      <Input.Password placeholder="Small Password" size="small" />
      <Input.Password placeholder="Middle Password" size="middle" />
      <Input.Password placeholder="Large Password" size="large" />
    </View>
  );
};

export default SizesDemo;
