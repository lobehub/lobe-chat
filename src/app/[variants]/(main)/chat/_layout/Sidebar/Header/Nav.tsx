'use client';

import { BotPromptIcon } from '@lobehub/ui/icons';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useParams } from 'react-router-dom';
import urlJoin from 'url-join';

import NavItem from '@/features/NavPanel/NavItem';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useChatStore } from '@/store/chat';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const Nav = memo(() => {
  const { t } = useTranslation('chat');
  const { t: topicT } = useTranslation('topic');
  const params = useParams();
  const agentId = params.aid;
  const pathname = usePathname();
  const isProfileActive = pathname.includes('/profile');
  const router = useQueryRoute();
  const { isAgentEditable } = useServerConfigStore(featureFlagsSelectors);
  const switchTopic = useChatStore((s) => s.switchTopic);

  const handleNewTopic = () => {
    // If in agent sub-route, navigate back to agent chat first
    if (isProfileActive && agentId) {
      router.push(urlJoin('/agent', agentId));
    }
    switchTopic(undefined);
  };

  return (
    <Flexbox gap={1}>
      {isAgentEditable && (
        <NavItem
          active={isProfileActive}
          icon={BotPromptIcon}
          onClick={() => {
            router.push(urlJoin('/agent', agentId!, 'profile'));
          }}
          title={t('tab.profile')}
        />
      )}
      <NavItem icon={SearchIcon} title={t('tab.search')} />
      <NavItem icon={PlusIcon} onClick={handleNewTopic} title={topicT('actions.addNewTopic')} />
    </Flexbox>
  );
});

export default Nav;
