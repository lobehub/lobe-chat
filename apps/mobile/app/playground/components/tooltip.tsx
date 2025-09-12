import TooltipPlayground from '@/features/playground/components/tooltip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function TooltipPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Tooltip 组件" />
      <TooltipPlayground />
    </SafeAreaView>
  );
}
