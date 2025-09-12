import TagPlayground from '@/features/playground/components/tag';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function TagPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Tag 组件" />
      <TagPlayground />
    </SafeAreaView>
  );
}
