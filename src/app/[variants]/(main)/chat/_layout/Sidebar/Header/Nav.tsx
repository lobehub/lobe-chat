'use client';

import { BotPromptIcon } from '@lobehub/ui/icons';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useParams } from 'react-router-dom';
import urlJoin from 'url-join';

import NavItem from '@/features/NavPanel/NavItem';
import { useQueryRoute } from '@/hooks/useQueryRoute';

const Nav = memo(() => {
  const params = useParams();
  const agentId = params.aid;
  const pathname = usePathname();
  const isProfileActive = pathname.includes('/profile');
  const router = useQueryRoute();
  return (
    <Flexbox gap={1}>
      <NavItem
        active={isProfileActive}
        icon={BotPromptIcon}
        onClick={() => {
          router.push(urlJoin('/agent', agentId!, 'profile'));
        }}
        title={'Profile'}
      />
    </Flexbox>
  );
});

export default Nav;
