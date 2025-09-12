import SwitchPlayground from '@/features/playground/components/switch';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function SwitchPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Switch 组件" />
      <SwitchPlayground />
    </SafeAreaView>
  );
}
