import FluentEmojiPlayground from '@/features/playground/components/fluentemoji';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

export default function FluentEmojiPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="FluentEmoji 组件" />
      <FluentEmojiPlayground />
    </SafeAreaView>
  );
}
