import { ActionIcon, MobileNavBarTitle } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { ChevronDown } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agent';
import { sessionSelectors } from '@/store/session/slices/session/selectors';

const ChatHeaderTitle = memo(() => {
  const { t } = useTranslation('chat');
  const toggleConfig = useGlobalStore((s) => s.toggleMobileTopic);
  const [topicLength, topic] = useChatStore((s) => [
    topicSelectors.currentTopicLength(s),
    topicSelectors.currentActiveTopic(s),
  ]);
  const [isInbox, title] = useSessionStore((s) => [
    sessionSelectors.isInboxSession(s),
    agentSelectors.currentAgentTitle(s),
  ]);
  const theme = useTheme();

  const displayTitle = isInbox ? t('inbox.title') : title;

  return (
    <MobileNavBarTitle
      desc={
        <Flexbox align={'center'} gap={4} horizontal onClick={() => toggleConfig()}>
          <ActionIcon
            active
            icon={ChevronDown}
            size={{ blockSize: 14, borderRadius: '50%', fontSize: 12 }}
            style={{
              background: theme.colorFillSecondary,
              color: theme.colorTextDescription,
            }}
          />
          <span>{topic?.title || t('topic.title')}</span>
        </Flexbox>
      }
      title={
        <div onClick={() => toggleConfig()}>
          {displayTitle}
          {topicLength > 1 ? `(${topicLength + 1})` : ''}
        </div>
      }
    />
  );
});

export default ChatHeaderTitle;
