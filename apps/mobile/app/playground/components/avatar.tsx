import AvatarPlayground from '@/features/playground/components/avatar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function AvatarPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Avatar 组件" />
      <AvatarPlayground />
    </SafeAreaView>
  );
}
