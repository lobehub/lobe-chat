import { Stack } from 'expo-router';

import { useThemedScreenOptions } from '@/_const/navigation';

export default function ChatRoutesLayout() {
  const themedScreenOptions = useThemedScreenOptions();

  return (
    <Stack
      screenOptions={{
        ...themedScreenOptions,
        headerShown: false,
      }}
    >
      {/* 聊天主页 */}
      <Stack.Screen name="index" />

      {/* 聊天设置 */}
      <Stack.Screen name="setting/index" />
      <Stack.Screen name="setting/avatar/index" />
      <Stack.Screen name="setting/name/index" />
      <Stack.Screen name="setting/description/index" />
      <Stack.Screen name="setting/system-role/index" />

      {/* 消息编辑 */}
      <Stack.Screen name="message/edit" />
    </Stack>
  );
}
