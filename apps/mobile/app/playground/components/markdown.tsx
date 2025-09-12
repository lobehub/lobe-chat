import MarkdownPlayground from '@/features/playground/components/markdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function MarkdownPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Markdown 组件" />
      <MarkdownPlayground />
    </SafeAreaView>
  );
}
