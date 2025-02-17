'use client';

import { ActionIcon, Avatar } from '@lobehub/ui';
import { ChatHeaderTitle } from '@lobehub/ui/chat';
import { Skeleton } from 'antd';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

import Tags from './Tags';

const Main = memo(() => {
  const { t } = useTranslation('chat');

  useInitAgentConfig();
  const [isPinned] = useQueryState('pinned', parseAsBoolean);

  const [init, isInbox, title, description, avatar, backgroundColor] = useSessionStore((s) => [
    sessionSelectors.isSomeSessionActive(s),
    sessionSelectors.isInboxSession(s),
    sessionMetaSelectors.currentAgentTitle(s),
    sessionMetaSelectors.currentAgentDescription(s),
    sessionMetaSelectors.currentAgentAvatar(s),
    sessionMetaSelectors.currentAgentBackgroundColor(s),
  ]);

  const openChatSettings = useOpenChatSettings();

  const displayTitle = isInbox ? t('inbox.title') : title;
  const displayDesc = isInbox ? t('inbox.desc') : description;
  const showSessionPanel = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);

  return !init ? (
    <Flexbox gap={4} horizontal>
      {!isPinned && (
        <ActionIcon
          aria-label={t('agents')}
          icon={showSessionPanel ? PanelLeftClose : PanelLeftOpen}
          onClick={() => {
            updateSystemStatus({
              sessionsWidth: showSessionPanel ? 0 : 320,
              showSessionPanel: !showSessionPanel,
            });
          }}
          size={DESKTOP_HEADER_ICON_SIZE}
          title={t('agents')}
        />
      )}
      <Skeleton
        active
        avatar={{ shape: 'circle', size: 'default' }}
        paragraph={false}
        title={{ style: { margin: 0, marginTop: 8 }, width: 200 }}
      />
    </Flexbox>
  ) : (
    <Flexbox align={'center'} gap={4} horizontal>
      {!isPinned && (
        <ActionIcon
          aria-label={t('agents')}
          icon={showSessionPanel ? PanelLeftClose : PanelLeftOpen}
          onClick={() => {
            updateSystemStatus({
              sessionsWidth: showSessionPanel ? 0 : 320,
              showSessionPanel: !showSessionPanel,
            });
          }}
          size={DESKTOP_HEADER_ICON_SIZE}
          title={t('agents')}
        />
      )}
      <Avatar
        avatar={avatar}
        background={backgroundColor}
        onClick={() => openChatSettings()}
        size={40}
        title={title}
      />
      <ChatHeaderTitle desc={displayDesc} tag={<Tags />} title={displayTitle} />
    </Flexbox>
  );
});

export default () => (
  <Suspense
    fallback={
      <Skeleton
        active
        avatar={{ shape: 'circle', size: 'default' }}
        paragraph={false}
        title={{ style: { margin: 0, marginTop: 8 }, width: 200 }}
      />
    }
  >
    <Main />
  </Suspense>
);
