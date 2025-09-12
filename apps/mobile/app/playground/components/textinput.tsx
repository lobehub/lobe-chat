import TextInputPlayground from '@/features/playground/components/textinput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyles } from './style';
import { Header } from '@/components';

export default function ThemeProviderPlaygroundPage() {
  const { styles } = useStyles();

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="TextInput 组件" />
      <TextInputPlayground />
    </SafeAreaView>
  );
}
