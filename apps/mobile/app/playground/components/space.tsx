import SpacePlayground from '@/features/playground/components/space';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function SpacePlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Space 组件" />
      <SpacePlayground />
    </SafeAreaView>
  );
}
