import ColorScalesPlayground from '@/features/playground/components/colorscales';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function ColorScalesPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="ColorScales 组件" />
      <ColorScalesPlayground />
    </SafeAreaView>
  );
}
