import { Stack } from 'expo-router';

import { useThemedScreenOptions } from '@/_const/navigation';

export default function MainLayout() {
  const themedScreenOptions = useThemedScreenOptions();

  return (
    <Stack screenOptions={themedScreenOptions}>
      {/* 聊天模块 */}
      <Stack.Screen name="chat" />

      {/* 会话管理 */}
      <Stack.Screen name="session" />

      {/* 话题管理 */}
      <Stack.Screen name="topic" />

      {/* 设置模块 */}
      <Stack.Screen name="setting" />
    </Stack>
  );
}
