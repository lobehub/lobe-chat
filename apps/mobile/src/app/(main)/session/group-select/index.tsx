import { SessionDefaultGroup, SessionGroupItem } from '@lobechat/types';
import { Cell, Empty, Flexbox, PageContainer, Toast } from '@lobehub/ui-rn';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';
import { sessionGroupSelectors } from '@/store/session/selectors';

type GroupListItem = SessionGroupItem | { id: 'default' | 'pinned'; name: string };

export default function GroupSelectPage() {
  const { t } = useTranslation('chat');
  const router = useRouter();
  const params = useLocalSearchParams<{
    currentGroupId?: string;
    isPinned?: string;
    sessionId: string;
  }>();
  const [loading, setLoading] = useState(false);
  const sessionGroupItems = useSessionStore(sessionGroupSelectors.sessionGroupItems);
  const [updateSessionGroupId, pinSession] = useSessionStore((s) => [
    s.updateSessionGroupId,
    s.pinSession,
  ]);

  const currentGroupId = params.currentGroupId || SessionDefaultGroup.Default;
  const isPinned = params.isPinned === 'true';

  // 组合数据：置顶 + 自定义分组 + 默认列表
  const listData = useMemo<GroupListItem[]>(() => {
    return [
      {
        id: 'pinned',
        name: t('pin'),
      },
      ...sessionGroupItems,
      {
        id: 'default',
        name: t('defaultList'),
      },
    ];
  }, [sessionGroupItems, t]);

  const handleSelectGroup = useCallback(
    async (groupId: string) => {
      setLoading(true);
      try {
        if (groupId === 'pinned') {
          // 移动到置顶 = 启用置顶
          await pinSession(params.sessionId, true);
          Toast.success(t('pin'));
        } else {
          // 如果当前是置顶状态，先取消置顶
          if (isPinned) {
            await pinSession(params.sessionId, false);
          }
          // 移动到目标分组
          const targetGroupId = groupId === 'default' ? SessionDefaultGroup.Default : groupId;
          await updateSessionGroupId(params.sessionId, targetGroupId);
          Toast.success(t('sessionGroup.moveSuccess'));
        }
        setLoading(false);
        router.back();
      } catch {
        Toast.error(t('error', { ns: 'common' }));
        setLoading(false);
      }
    },
    [params.sessionId, isPinned, updateSessionGroupId, pinSession, router, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: GroupListItem }) => {
      let isSelected = false;

      if (item.id === 'pinned') {
        // 置顶分组：当前 session 是否被置顶
        isSelected = isPinned;
      } else if (item.id === 'default') {
        // 默认分组：未置顶 且 分组ID是默认分组
        isSelected = !isPinned && currentGroupId === SessionDefaultGroup.Default;
      } else {
        // 自定义分组：未置顶 且 分组ID匹配
        isSelected = !isPinned && currentGroupId === item.id;
      }

      return (
        <Cell
          borderRadius
          disabled={loading}
          extra={isSelected ? <Check size={20} /> : undefined}
          loading={loading}
          onPress={() => handleSelectGroup(item.id)}
          pressEffect
          showArrow={false}
          title={item.name}
          variant="outlined"
        />
      );
    },
    [isPinned, currentGroupId, handleSelectGroup, loading],
  );

  return (
    <PageContainer showBack title={t('sessionGroup.moveGroup')}>
      <Flexbox flex={1}>
        <FlashList
          ItemSeparatorComponent={() => <Flexbox height={8} />}
          ListEmptyComponent={<Empty description={t('sessionGroup.emptyGroup')} />}
          contentContainerStyle={{
            opacity: loading ? 0.5 : 1,
            padding: 16,
          }}
          data={listData}
          keyExtractor={(item: GroupListItem) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </Flexbox>
    </PageContainer>
  );
}
