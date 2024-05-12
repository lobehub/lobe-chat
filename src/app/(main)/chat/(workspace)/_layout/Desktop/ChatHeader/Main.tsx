'use client';

import { ActionIcon, Avatar, ChatHeaderTitle } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

import Tags from './Tags';

const Main = memo(() => {
  const { t } = useTranslation('chat');

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
  const showSessionPanel = useGlobalStore((s) => s.preference.showSessionPanel);

  return !init ? (
    <Flexbox horizontal>
      <Skeleton
        active
        avatar={{ shape: 'circle', size: 'default' }}
        paragraph={false}
        title={{ style: { margin: 0, marginTop: 8 }, width: 200 }}
      />
    </Flexbox>
  ) : (
    <Flexbox align={'flex-start'} gap={12} horizontal>
      {isChatPath && (
        <Link aria-label={t('agentsAndConversations')} href={'/chat'}>
          <ActionIcon
            icon={showSessionPanel ? PanelLeftClose : PanelLeftOpen}
            onClick={() => {
              const currentShowSessionPanel = useGlobalStore.getState().preference.showSessionPanel;
              useGlobalStore.getState().updatePreference({
                sessionsWidth: currentShowSessionPanel ? 0 : 320,
                showSessionPanel: !currentShowSessionPanel,
              });
            }}
            size="large"
            title={t('agentsAndConversations')}
          />
        </Link>
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

export default Main;
