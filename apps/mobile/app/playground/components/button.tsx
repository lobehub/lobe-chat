import ButtonPlayground from '@/features/playground/components/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function ButtonPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Button 组件" />
      <ButtonPlayground />
    </SafeAreaView>
  );
}
