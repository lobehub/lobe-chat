import { Icon, type MenuProps } from '@lobehub/ui';
import { App } from 'antd';
import { LucideCheck, Trash } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';
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

  return useMemo(() => {
    const displayModeItems = Object.values(TopicDisplayMode).map((mode) => ({
      icon: topicDisplayMode === mode ? <Icon icon={LucideCheck} /> : <div />,
      key: mode,
      label: t(`groupMode.${mode}`),
      onClick: () => {
        updatePreference({ topicDisplayMode: mode });
      },
    }));

    return [
      ...displayModeItems,
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
  }, [topicDisplayMode, updatePreference, removeUnstarredTopic, removeAllTopic, t, modal]);
};
