import SkeletonPlayground from '@/features/playground/components/skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function SkeletonPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Skeleton 组件" />
      <SkeletonPlayground />
    </SafeAreaView>
  );
}
