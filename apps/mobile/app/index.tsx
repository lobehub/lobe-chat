import { Redirect } from 'expo-router';
import { useAuth } from '@/store/user';

export default function Page() {
  const { isAuthenticated, isInitialized } = useAuth();

  // 如果未初始化或未认证，则不渲染
  if (!isInitialized || !isAuthenticated) {
    return null;
  }

  return <Redirect href="/chat" />;
}
