import { Cell, Dropdown, type DropdownOptionItem, Icon, Toast, useTheme } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { loading as loadingService } from '@/libs/loading';
import { useSessionStore } from '@/store/session';

interface SessionGroupHeaderProps {
  count: number;
  groupId?: string; // 自定义分组 ID
  isExpanded: boolean;
  onPress: () => void;
  title: string;
}

/**
 * SessionGroupHeader - Session 分组头部组件
 * 点击折叠/展开，长按显示分组管理菜单
 */
const SessionGroupHeader = memo<SessionGroupHeaderProps>(
  ({ title, isExpanded, onPress, groupId }) => {
    const theme = useTheme();
    const { t } = useTranslation('chat');
    const router = useRouter();
    const [createSession, removeSessionGroup] = useSessionStore((s) => [
      s.createSession,
      s.removeSessionGroup,
    ]);

    // 在该分组下新建 session
    const handleCreateSession = useCallback(async () => {
      const { done } = loadingService.start();
      try {
        await createSession({ group: groupId });
        Toast.success(t('newAgent'));
        done();
      } catch {
        Toast.error(t('error', { ns: 'common' }));
        done();
      }
    }, [createSession, groupId, t]);

    // 删除分组
    const handleDeleteGroup = useCallback(() => {
      if (!groupId) return;
      Alert.alert(t('sessionGroup.confirmRemoveGroupAlert'), title, [
        {
          style: 'cancel',
          text: t('actions.cancel', { ns: 'common' }),
        },
        {
          onPress: async () => {
            const { done } = loadingService.start();
            try {
              await removeSessionGroup(groupId);
              Toast.success(t('sessionGroup.removeSuccess'));
            } catch {
              Toast.error(t('error', { ns: 'common' }));
            } finally {
              done();
            }
          },
          style: 'destructive',
          text: t('actions.confirm', { ns: 'common' }),
        },
      ]);
    }, [groupId, title, removeSessionGroup, t]);

    const menuOptions: DropdownOptionItem[] = useMemo(() => {
      const options: DropdownOptionItem[] = [
        groupId && {
          icon: {
            name: 'plus.circle',
            pointSize: 18,
          },
          key: 'createSession',
          onSelect: handleCreateSession,
          title: t('newAgent'),
        },
        groupId && {
          icon: {
            name: 'pencil',
            pointSize: 18,
          },
          key: 'rename',
          onSelect: () => {
            router.push({
              params: { id: groupId, name: title },
              pathname: '/session/group-rename',
            });
          },
          title: t('sessionGroup.rename'),
        },
        {
          icon: {
            name: 'gear',
            pointSize: 18,
          },
          key: 'manageGroups',
          onSelect: () => {
            router.push('/session/group-config');
          },
          title: t('sessionGroup.config'),
        },
        groupId && {
          destructive: true,
          icon: {
            name: 'trash',
            pointSize: 18,
          },
          key: 'delete',
          onSelect: handleDeleteGroup,
          title: t('actions.delete', { ns: 'common' }),
        },
      ].filter(Boolean) as DropdownOptionItem[];
      return options;
    }, [groupId, title, router, t, handleCreateSession, handleDeleteGroup]);

    return (
      <Dropdown options={menuOptions} trigger="longPress">
        <Cell
          extra={
            <Icon
              color={theme.colorTextDescription}
              icon={ChevronDown}
              size={16}
              style={[
                {
                  transform: [{ rotate: isExpanded ? '0deg' : '-90deg' }],
                },
              ]}
            />
          }
          onPress={onPress}
          paddingBlock={4}
          paddingInline={16}
          pressEffect
          showArrow={false}
          style={{ minHeight: 40 }}
          title={title}
          titleProps={{
            fontSize: 13,
            type: 'secondary',
          }}
        />
      </Dropdown>
    );
  },
);

SessionGroupHeader.displayName = 'SessionGroupHeader';

export default SessionGroupHeader;
