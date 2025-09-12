import CapsuleTabsPlayground from '@/features/playground/components/capsuletabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function CapsuleTabsPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="CapsuleTabs 组件" />
      <CapsuleTabsPlayground />
    </SafeAreaView>
  );
}
