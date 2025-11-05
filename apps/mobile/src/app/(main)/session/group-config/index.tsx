import { SessionGroupItem } from '@lobechat/types';
import { Cell, CenterProps, Empty, Flexbox, PageContainer, Toast, useTheme } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { FolderOpen, GripVertical, PencilLine, PlusIcon, Trash } from 'lucide-react-native';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';

import ActionIcon from '@/components/ActionIcon';
import { loading as loadingService } from '@/libs/loading';
import { useSessionStore } from '@/store/session';
import { sessionGroupSelectors } from '@/store/session/selectors';

/**
 * 分组项组件
 */
const GroupItem = memo<
  SessionGroupItem & {
    onDelete: () => void;
    onRename: () => void;
  } & CenterProps
>(({ name, onRename, onDelete, ...rest }) => {
  const theme = useTheme();
  return (
    <Cell
      borderRadius={true}
      extra={
        <Flexbox align="center" gap={4} horizontal>
          <ActionIcon
            color={theme.colorTextDescription}
            icon={PencilLine}
            onPress={onRename}
            size={16}
          />
          <ActionIcon
            color={theme.colorTextDescription}
            icon={Trash}
            onPress={onDelete}
            size={16}
          />
        </Flexbox>
      }
      icon={GripVertical}
      iconProps={{
        color: theme.colorTextDescription,
      }}
      showArrow={false}
      title={name}
      variant={'outlined'}
      {...rest}
    />
  );
});

GroupItem.displayName = 'GroupItem';

/**
 * 分组管理页面
 */
export default function GroupConfigScreen() {
  const { t } = useTranslation('chat');
  const router = useRouter();

  const sessionGroupItems = useSessionStore(sessionGroupSelectors.sessionGroupItems);
  const [addSessionGroup, updateSessionGroupSort, removeSessionGroup] = useSessionStore((s) => [
    s.addSessionGroup,
    s.updateSessionGroupSort,
    s.removeSessionGroup,
  ]);

  const [loading, setLoading] = useState(false);

  // 添加新分组
  const handleAddGroup = useCallback(async () => {
    setLoading(true);
    try {
      await addSessionGroup(t('sessionGroup.newGroup'));
      Toast.success(t('sessionGroup.createSuccess'));
    } catch {
      Toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  }, [addSessionGroup, t]);

  // 跳转到重命名页面
  const handleRename = useCallback(
    (item: SessionGroupItem) => {
      router.push({
        params: { id: item.id, name: item.name },
        pathname: '/session/group-rename',
      });
    },
    [router],
  );

  // 删除分组
  const handleDeleteGroup = useCallback(
    (id: string, name: string) => {
      Alert.alert(t('sessionGroup.confirmRemoveGroupAlert'), name, [
        {
          style: 'cancel',
          text: t('cancel'),
        },
        {
          onPress: async () => {
            try {
              await loadingService.start(removeSessionGroup(id));
              Toast.success(t('sessionGroup.removeSuccess'));
            } catch {
              Toast.error(t('error'));
            }
          },
          style: 'destructive',
          text: t('confirm'),
        },
      ]);
    },
    [removeSessionGroup, t],
  );

  // 拖拽排序
  const handleDragEnd = useCallback(
    ({ data }: { data: SessionGroupItem[] }) => {
      updateSessionGroupSort(data);
    },
    [updateSessionGroupSort],
  );

  // 渲染分组项
  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<SessionGroupItem>) => {
      return (
        <ScaleDecorator>
          <GroupItem
            {...item}
            disabled={isActive}
            onDelete={() => handleDeleteGroup(item.id, item.name)}
            onLongPress={drag}
            onRename={() => handleRename(item)}
          />
        </ScaleDecorator>
      );
    },
    [handleDeleteGroup, handleRename],
  );

  return (
    <PageContainer
      extra={<ActionIcon icon={PlusIcon} loading={loading} onPress={handleAddGroup} />}
      showBack
      title={t('sessionGroup.config')}
    >
      <Flexbox flex={1} style={{ position: 'relative' }}>
        <DraggableFlatList
          ListEmptyComponent={
            <Empty description={t('sessionGroup.emptyGroup')} icon={FolderOpen} />
          }
          contentContainerStyle={{
            gap: 8,
            padding: 8,
          }}
          data={sessionGroupItems}
          keyExtractor={(item) => item.id}
          onDragEnd={handleDragEnd}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          style={{
            height: '100%',
          }}
        />
      </Flexbox>
    </PageContainer>
  );
}
