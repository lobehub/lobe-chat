import { Center, PageContainer, Text } from '@lobehub/ui-rn';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { safeReplaceLogin } from '@/navigation/safeLogin';

type AuthCallbackParams = {
  error?: string | string[];
};

// 处理 OAuth 回调的占位页面
// Android 在完成外部浏览器登录后会通过 deep link 打开 com.lobehub.app://auth/callback
// 如果没有该页面，会短暂进入 +not-found。这里立即跳转到首页，由首页再根据认证状态进入 /chat。
export default function AuthCallback() {
  const router = useRouter();
  const { error } = useLocalSearchParams<AuthCallbackParams>();

  // 立即导航到首页，避免展示 404 页面
  const errorParam = Array.isArray(error) ? error[0] : error;

  // 认证失败时返回上一页（通常是登录页），避免额外的跳转动画
  if (errorParam) {
    if (router.canGoBack()) {
      router.back();
    } else {
      safeReplaceLogin(router);
    }
    return;
  }

  return (
    <PageContainer>
      <Center flex={1} gap={12} justify="center">
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>登录中，请稍候...</Text>
      </Center>
    </PageContainer>
  );
}
