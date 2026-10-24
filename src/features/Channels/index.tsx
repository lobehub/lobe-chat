import { Flexbox, Text } from '@lobehub/ui';
import * as stylex from '@stylexjs/stylex';
import { useSize } from 'ahooks';
import { Hash } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router';

import NavHeader from '@/features/NavHeader';
import { channelActions, channelSelectors, useChannelStore } from '@/store/channel';

import { visibleChannelDetail } from './channelAccess';
import { ChannelConversation } from './ChannelConversation';
import { MemberStatus } from './MemberStatus';
import { styles } from './styles';
import { THREAD_FLOAT_BREAKPOINT, ThreadPanel } from './ThreadPanel';

/** One Channel: the main conversation, with a thread beside it. */
export default function ChannelPage() {
  const { t } = useTranslation('channel');
  const { channelId } = useParams<{ channelId: string }>();
  const [params, setParams] = useSearchParams();
  const threadId = params.get('thread');
  const conversationRef = useRef<HTMLDivElement>(null);
  const conversationWidth = useSize(conversationRef)?.width;
  // Shares the main conversation's request; the header and thread panel read the same view.
  const view = { channelId: channelId ?? '', threadId: null };
  const sync = channelActions.useFetchDetail(channelId ? view : null);
  const detail = visibleChannelDetail(useChannelStore(channelSelectors.detail(view)), sync.error);
  if (!channelId) return null;

  const setThread = (id: string | null) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (id) next.set('thread', id);
      else next.delete('thread');
      return next;
    });

  return (
    <Flexbox {...stylex.props(styles.layout)}>
      <NavHeader
        right={detail && <MemberStatus detail={detail} />}
        left={
          <Flexbox horizontal align="center" gap={8}>
            <Hash size={18} />
            <Text ellipsis weight={500}>
              {detail?.channel.title || t('title')}
            </Text>
          </Flexbox>
        }
      />
      <Flexbox horizontal ref={conversationRef} {...stylex.props(styles.conversations)}>
        <ChannelConversation
          channelId={channelId}
          inert={!!threadId && (conversationWidth ?? 1000) < THREAD_FLOAT_BREAKPOINT}
          key={channelId}
          onOpenThread={(id) => setThread(threadId === id ? null : id)}
        />
        {detail && (
          <ThreadPanel
            availableWidth={conversationWidth}
            detail={detail}
            key={`thread:${channelId}`}
            threadId={threadId}
            onClose={() => setThread(null)}
          />
        )}
      </Flexbox>
    </Flexbox>
  );
}
