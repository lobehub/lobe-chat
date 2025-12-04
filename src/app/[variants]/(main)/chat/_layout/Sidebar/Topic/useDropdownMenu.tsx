import { Icon, type MenuProps } from '@lobehub/ui';
import { App } from 'antd';
import { Hash, LucideCheck, Trash } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import { TopicDisplayMode } from '@/types/topic';

export const useTopicActionsDropdownMenu = (): MenuProps['items'] => {
  const { t } = useTranslation(['topic', 'common']);
  const { modal } = App.useApp();

  const [removeUnstarredTopic, removeAllTopic] = useChatStore((s) => [
    s.removeUnstarredTopic,
    s.removeSessionTopics,
  ]);

  const [topicDisplayMode, updatePreference] = useUserStore((s) => [
    preferenceSelectors.topicDisplayMode(s),
    s.updatePreference,
  ]);

  const [topicPageSize, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.topicPageSize(s),
    s.updateSystemStatus,
  ]);

  return useMemo(() => {
    const displayModeItems = Object.values(TopicDisplayMode).map((mode) => ({
      icon: topicDisplayMode === mode ? <Icon icon={LucideCheck} /> : <div />,
      key: mode,
      label: t(`groupMode.${mode}`),
      onClick: () => {
        updatePreference({ topicDisplayMode: mode });
      },
    }));

    const pageSizeOptions = [20, 40, 60, 100];
    const pageSizeItems = pageSizeOptions.map((size) => ({
      icon: topicPageSize === size ? <Icon icon={LucideCheck} /> : <div />,
      key: `pageSize-${size}`,
      label: `${size} 个条目`,
      onClick: () => {
        updateSystemStatus({ topicPageSize: size });
      },
    }));

    return [
      ...displayModeItems,
      {
        type: 'divider' as const,
      },
      {
        children: pageSizeItems,
        icon: <Icon icon={Hash} />,
        key: 'displayItems',
        label: t('displayItems'),
      },
      {
        type: 'divider' as const,
      },
      {
        icon: <Icon icon={Trash} />,
        key: 'deleteUnstarred',
        label: t('actions.removeUnstarred'),
        onClick: () => {
          modal.confirm({
            cancelText: t('cancel', { ns: 'common' }),
            centered: true,
            okButtonProps: { danger: true },
            okText: t('ok', { ns: 'common' }),
            onOk: removeUnstarredTopic,
            title: t('actions.confirmRemoveUnstarred'),
          });
        },
      },
      {
        danger: true,
        icon: <Icon icon={Trash} />,
        key: 'deleteAll',
        label: t('actions.removeAll'),
        onClick: () => {
          modal.confirm({
            cancelText: t('cancel', { ns: 'common' }),
            centered: true,
            okButtonProps: { danger: true },
            okText: t('ok', { ns: 'common' }),
            onOk: removeAllTopic,
            title: t('actions.confirmRemoveAll'),
          });
        },
      },
    ].filter(Boolean) as MenuProps['items'];
  }, [
    topicDisplayMode,
    topicPageSize,
    updatePreference,
    updateSystemStatus,
    removeUnstarredTopic,
    removeAllTopic,
    t,
    modal,
  ]);
};
