import ColorSwatchesPlayground from '@/features/playground/components/colorswatches';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function ColorSwatchesPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="ColorSwatches 组件" />
      <ColorSwatchesPlayground />
    </SafeAreaView>
  );
}
