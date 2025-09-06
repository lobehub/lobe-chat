import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';

// 处理 OAuth 回调的占位页面
// Android 在完成外部浏览器登录后会通过 deep link 打开 com.lobehub.app://auth/callback
// 如果没有该页面，会短暂进入 +not-found。这里立即跳转到首页，由首页再根据认证状态进入 /chat。
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // 立即导航到首页，避免展示 404 页面
    const t = setTimeout(() => router.replace('/'), 0);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 12 }}>正在处理登录...</Text>
    </View>
  );
}
