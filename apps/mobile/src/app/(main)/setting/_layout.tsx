import { Stack } from 'expo-router';

import { useThemedScreenOptions } from '@/_const/navigation';

export default function SettingRoutesLayout() {
  const themedScreenOptions = useThemedScreenOptions();

  return (
    <Stack screenOptions={themedScreenOptions}>
      {/* 设置主页 */}
      <Stack.Screen name="index" />

      {/* 模型供应商 */}
      <Stack.Screen name="providers/index" />
      <Stack.Screen name="providers/[id]/index" />

      {/* 外观设置 */}
      <Stack.Screen name="themeMode/index" />
      <Stack.Screen name="color/index" />
      <Stack.Screen name="fontSize/index" />

      {/* 语言设置 */}
      <Stack.Screen name="locale/index" />

      {/* 账户设置 */}
      <Stack.Screen name="account/index" />

      {/* 开发者设置 */}
      <Stack.Screen name="developer/index" />
      <Stack.Screen name="developer/custom-server/index" />
    </Stack>
  );
}
