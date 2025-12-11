'use client';

import { ActionIcon } from '@lobehub/ui';
import { MessageSquarePlusIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useAgentGroupStore } from '@/store/agentGroup';
import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum } from '@/types/hotkey';

const AddTopicButon = memo(() => {
  const { t } = useTranslation('topic');
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.SaveTopic));
  const activeGroupId = useAgentGroupStore((s) => s.activeGroupId);
  const router = useQueryRoute();
  const hasTopic = useChatStore((s) => !!s.activeTopicId);

  if (!hasTopic || !activeGroupId) return null;

  return (
    <ActionIcon
      icon={MessageSquarePlusIcon}
      onClick={() => {
        router.push(urlJoin('/group', activeGroupId));
      }}
      size={DESKTOP_HEADER_ICON_SIZE}
      title={t('actions.addNewTopic')}
      tooltipProps={{
        hotkey,
        placement: 'bottom',
      }}
    />
  );
});

export default AddTopicButon;
