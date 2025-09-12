import ToastPlayground from '@/features/playground/components/toast';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function ToastPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Toast 组件" />
      <ToastPlayground />
    </SafeAreaView>
  );
}
