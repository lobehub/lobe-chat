import { Redirect } from 'expo-router';
import { useAuth } from '@/store/user';

export default function Page() {
  const { isAuthenticated, isInitialized } = useAuth();

  // 只有在认证完全初始化后才进行导航
  if (isInitialized && isAuthenticated) {
    return <Redirect href="/chat" />;
  }

  // 在认证状态未确定时不渲染任何内容，让 SplashScreen 继续显示
  return null;
}
