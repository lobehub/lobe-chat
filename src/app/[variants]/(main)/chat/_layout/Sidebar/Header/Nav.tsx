'use client';

import { BotPromptIcon } from '@lobehub/ui/icons';
import { SearchIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useParams } from 'react-router-dom';
import urlJoin from 'url-join';

import NavItem from '@/features/NavPanel/NavItem';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const Nav = memo(() => {
  const { t } = useTranslation('chat');
  const params = useParams();
  const agentId = params.aid;
  const pathname = usePathname();
  const isProfileActive = pathname.includes('/profile');
  const router = useQueryRoute();
  const { isAgentEditable } = useServerConfigStore(featureFlagsSelectors);

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
    </Flexbox>
  );
});

export default Nav;
