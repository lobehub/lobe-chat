import SliderPlayground from '@/features/playground/components/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function SliderPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Slider 组件" />
      <SliderPlayground />
    </SafeAreaView>
  );
}
