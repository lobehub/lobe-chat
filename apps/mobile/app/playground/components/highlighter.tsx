import HighlighterPlayground from '@/features/playground/components/highlighter';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function HighlighterPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Highlighter 组件" />
      <HighlighterPlayground />
    </SafeAreaView>
  );
}
