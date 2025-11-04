import { Stack } from 'expo-router';

import { useThemedScreenOptions } from '@/_const/navigation';

export default function DiscoverLayout() {
  const themedScreenOptions = useThemedScreenOptions();

  return (
    <Stack screenOptions={themedScreenOptions}>
      {/* 助手搜索页面 */}
      <Stack.Screen name="assistant/search" />

      {/* 助手详情页面 - 支持多级路径 */}
      <Stack.Screen name="assistant/[...slugs]" />

      {/* 发现首页（如果存在） */}
      <Stack.Screen name="assistant/index" />
    </Stack>
  );
}
