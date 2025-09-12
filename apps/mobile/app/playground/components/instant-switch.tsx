import InstantSwitchPlayground from '@/features/playground/components/instant-switch';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function InstantSwitchPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="InstantSwitch 组件" />
      <InstantSwitchPlayground />
    </SafeAreaView>
  );
}
