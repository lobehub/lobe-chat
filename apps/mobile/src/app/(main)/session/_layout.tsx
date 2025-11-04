import { Stack } from 'expo-router';

import { useThemedScreenOptions } from '@/_const/navigation';

export default function SessionLayout() {
  const themedScreenOptions = useThemedScreenOptions();

  return (
    <Stack screenOptions={themedScreenOptions}>
      {/* 会话搜索 */}
      <Stack.Screen name="search/index" />

      {/* 会话分组配置 */}
      <Stack.Screen name="group-config/index" />

      {/* 会话分组重命名 */}
      <Stack.Screen name="group-rename/index" />

      {/* 会话分组选择 */}
      <Stack.Screen name="group-select/index" />
    </Stack>
  );
}
