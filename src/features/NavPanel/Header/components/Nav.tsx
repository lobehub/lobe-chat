'use client';

import { Compass, FolderClosed, HomeIcon, Palette } from 'lucide-react';
import { memo, useCallback, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { useGlobalStore } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

import NavItem from '../../NavItem';

const Nav = memo(() => {
  const [isPending, startTransition] = useTransition();
  const tab = useActiveTabKey();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { showMarket, enableKnowledgeBase, showAiImage } =
    useServerConfigStore(featureFlagsSelectors);
  const [switchBackToChat] = useGlobalStore((s) => [s.switchBackToChat]);
  const activeSessionId = useSessionStore((s) => s.activeId);
  const handleSwitchToChat = useCallback(
    (activeSessionId: string) =>
      startTransition(() => {
        switchBackToChat(activeSessionId);
      }),
    [switchBackToChat],
  );

  const handleNavigate = useCallback(
    (path: string) => startTransition(() => navigate(path)),
    [navigate],
  );

  return (
    <Flexbox gap={1}>
      <NavItem
        active={tab === SidebarTabKey.Chat}
        disabled={isPending}
        icon={HomeIcon}
        onClick={() => handleSwitchToChat(activeSessionId)}
        title={t('tab.chat')}
      />
      <NavItem
        active={tab === SidebarTabKey.Knowledge}
        disabled={isPending}
        hidden={!enableKnowledgeBase}
        icon={FolderClosed}
        onClick={() => handleNavigate('/knowledge')}
        title={t('tab.knowledgeBase')}
      />
      <NavItem
        active={tab === SidebarTabKey.Knowledge}
        disabled={isPending}
        hidden={!showAiImage}
        icon={Palette}
        onClick={() => handleNavigate('/image')}
        title={t('tab.aiImage')}
      />
      <NavItem
        active={tab === SidebarTabKey.Discover}
        disabled={isPending}
        hidden={!showMarket}
        icon={Compass}
        onClick={() => handleNavigate('/discover')}
        title={t('tab.discover')}
      />
    </Flexbox>
  );
});

export default Nav;
