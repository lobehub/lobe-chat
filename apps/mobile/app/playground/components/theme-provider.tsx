import ThemeProviderDemosSection from '@/features/playground/components/theme-provider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyles } from './style';
import { Header } from '@/components';

export default function ThemeProviderPlaygroundPage() {
  const { styles } = useStyles();

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="ThemeProvider 组件" />
      <ThemeProviderDemosSection />
    </SafeAreaView>
  );
}
