import { ActionIcon } from '@lobehub/ui';
import { ChatHeader } from '@lobehub/ui/mobile';
import { useTheme } from 'antd-style';
import { ChevronDown } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

const ChatHeaderTitle = memo(() => {
  const { t } = useTranslation(['chat', 'topic']);
  const toggleConfig = useGlobalStore((s) => s.toggleMobileTopic);
  const [topicLength, topic] = useChatStore((s) => [
    topicSelectors.currentTopicLength(s),
    topicSelectors.currentActiveTopic(s),
  ]);
  const [isInbox, title] = useSessionStore((s) => [
    sessionSelectors.isInboxSession(s),
    sessionMetaSelectors.currentAgentTitle(s),
  ]);
  const theme = useTheme();

  const displayTitle = isInbox ? t('inbox.title') : title;

  return (
    <ChatHeader.Title
      desc={
        <Flexbox align={'center'} gap={4} horizontal onClick={() => toggleConfig()}>
          <span
            style={{
              maxWidth: '60vw',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {topic?.title || t('title', { ns: 'topic' })}
          </span>
          <ActionIcon
            active
            icon={ChevronDown}
            size={{ blockSize: 14, borderRadius: '50%', size: 12 }}
            style={{
              background: theme.colorFillSecondary,
              color: theme.colorTextDescription,
            }}
          />
        </Flexbox>
      }
      title={
        <div
          onClick={() => toggleConfig()}
          style={{
            marginRight: '8px',
            maxWidth: '64vw',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayTitle}
          {topicLength > 1 ? `(${topicLength + 1})` : ''}
        </div>
      }
    />
  );
});

export default ChatHeaderTitle;
