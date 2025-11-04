import { Stack } from 'expo-router';

import { useThemedScreenOptions } from '@/_const/navigation';

export default function TopicLayout() {
  const themedScreenOptions = useThemedScreenOptions();

  return (
    <Stack screenOptions={themedScreenOptions}>
      {/* 话题搜索 */}
      <Stack.Screen name="search/index" />

      {/* 话题重命名 */}
      <Stack.Screen name="rename/index" />
    </Stack>
  );
}
