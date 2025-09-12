import ListItemPlayground from '@/features/playground/components/listitem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function ListItemPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="ListItem 组件" />
      <ListItemPlayground />
    </SafeAreaView>
  );
}
