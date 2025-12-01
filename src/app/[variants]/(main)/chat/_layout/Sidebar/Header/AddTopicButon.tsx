'use client';

import { ActionIcon } from '@lobehub/ui';
import { MessageSquarePlusIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import urlJoin from 'url-join';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useChatStore } from '@/store/chat';

const AddTopicButon = memo(() => {
  const { t } = useTranslation('topic');
  const params = useParams();
  const agentId = params.aid;
  const pathname = usePathname();
  const isProfileActive = pathname.includes('/profile');
  const router = useQueryRoute();
  const switchTopic = useChatStore((s) => s.switchTopic);

  const handleNewTopic = () => {
    // If in agent sub-route, navigate back to agent chat first
    if (isProfileActive && agentId) {
      router.push(urlJoin('/agent', agentId));
    }
    switchTopic(undefined);
  };

  return (
    <ActionIcon
      icon={MessageSquarePlusIcon}
      onClick={handleNewTopic}
      size={DESKTOP_HEADER_ICON_SIZE}
      title={t('actions.addNewTopic')}
      tooltipProps={{
        placement: 'bottom',
      }}
    />
  );
});

export default AddTopicButon;
