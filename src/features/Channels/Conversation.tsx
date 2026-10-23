import type { ChannelPublicMessage } from '@lobechat/types';
import { ActionIcon, Button, Center, Flexbox, Text } from '@lobehub/ui';
import * as stylex from '@stylexjs/stylex';
import { ArrowLeft, Hash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import AsyncBoundary from '@/components/AsyncBoundary';
import AsyncError from '@/components/AsyncError';
import Markdown from '@/features/Conversation/Markdown';
import { createStore, Provider } from '@/features/Conversation/store';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { channelService } from '@/services/channel';
import { channelActions, channelSelectors, useChannelStore } from '@/store/channel';

import { visibleChannelDetail } from './channelAccess';
import { Composer } from './Composer';
import { memberName } from './memberName';
import { Message } from './Message';
import { styles } from './styles';
import { useChannelEvents } from './useChannelEvents';

const Timeline = ({ channelId, threadId }: { channelId: string; threadId?: string }) => {
  const { t } = useTranslation('channel');
  const navigate = useWorkspaceAwareNavigate();
  const [before, setBefore] = useState<number>();
  const [actionError, setActionError] = useState<unknown>();
  const params = { before, channelId, threadId };
  const sync = channelActions.useFetchDetail(params);
  const cached = useChannelStore(channelSelectors.detail(params));
  const detail = visibleChannelDetail(cached, sync.error);
  const end = useRef<HTMLDivElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const lastMessageId = detail?.messages.at(-1)?.id;
  const sequence = detail?.channel.sequence;
  useChannelEvents(params);
  useEffect(() => {
    if (follow.current && before === undefined) end.current?.scrollIntoView({ block: 'end' });
  }, [lastMessageId, before]);
  useEffect(() => {
    if (sequence === undefined || before !== undefined) return;
    void channelService
      .markRead(channelId, sequence)
      .catch((error: unknown) => console.error('Failed to mark Channel read', error));
  }, [channelId, sequence, before]);
  const openThread = async (message: ChannelPublicMessage) => {
    if (!detail) return;
    const existing = detail.threads.find((thread) => thread.rootMessageId === message.id);
    const thread =
      existing ??
      (await channelService.createThread(channelId, message.id, message.recipientMemberIds)).data;
    navigate(`/channels/${channelId}/threads/${thread.id}`);
  };
  const stop = async () => {
    setActionError(undefined);
    try {
      await channelActions.stop(channelId, { threadId: threadId ?? null });
    } catch (cause) {
      console.error('Failed to stop Channel replies', cause);
      setActionError(cause);
    }
  };
  const branch = detail?.threads.find((thread) => thread.id === threadId);
  const activeMembers = detail?.members.filter((member) => member.active) ?? [];
  const replying = detail?.jobs.some(
    (job) => !job.publicationRevoked && (job.status === 'queued' || job.status === 'running'),
  );
  return (
    <section {...stylex.props(styles.page)}>
      <Flexbox horizontal align="center" gap={12} padding={16} {...stylex.props(styles.header)}>
        <ActionIcon
          aria-label={t(threadId ? 'backToChannel' : 'backToList')}
          icon={ArrowLeft}
          onClick={() => navigate(threadId ? `/channels/${channelId}` : '/channels')}
        />
        <Hash size={20} />
        <Flexbox flex={1} gap={2}>
          <h1 {...stylex.props(styles.heading)}>
            {threadId ? t('thread') : detail?.channel.title || t('title')}
          </h1>
          {detail && (
            <Text type="secondary">
              {threadId && branch
                ? t('followers', {
                    names:
                      branch.followerMemberIds
                        .map((id) =>
                          memberName(
                            detail.members.find((member) => member.id === id),
                            t('deletedMember'),
                          ),
                        )
                        .join('、') || t('noFollowers'),
                  })
                : t('members', {
                    names: activeMembers
                      .map((member) => memberName(member, t('deletedMember')))
                      .join('、'),
                  })}
            </Text>
          )}
        </Flexbox>
      </Flexbox>
      <AsyncBoundary
        data={detail}
        error={sync.error}
        isLoading={!detail && !sync.error}
        onRetry={() => void channelActions.refreshDetail(params)}
      >
        {detail && (
          <>
            {!!sync.error && (
              <AsyncError
                error={sync.error}
                variant="inline"
                onRetry={() => void channelActions.refreshDetail(params)}
              />
            )}
            <div
              ref={scroll}
              {...stylex.props(styles.timeline)}
              onScroll={() => {
                const element = scroll.current;
                if (element)
                  follow.current =
                    element.scrollHeight - element.scrollTop - element.clientHeight < 100;
              }}
            >
              <div {...stylex.props(styles.content)}>
                {detail.rootMessage && (
                  <blockquote {...stylex.props(styles.quote)}>
                    <Markdown>{detail.rootMessage.content}</Markdown>
                  </blockquote>
                )}
                <Flexbox horizontal gap={8}>
                  {detail.hasMore && (
                    <Button onClick={() => setBefore(detail.messages[0]?.sequence)}>
                      {t('olderMessages')}
                    </Button>
                  )}
                  {before !== undefined && (
                    <Button
                      onClick={() => {
                        follow.current = true;
                        setBefore(undefined);
                      }}
                    >
                      {t('latestMessages')}
                    </Button>
                  )}
                </Flexbox>
                {!detail.messages.length && (
                  <Center gap={8} padding={48}>
                    <Text>{t(threadId ? 'threadEmpty' : 'conversationEmpty')}</Text>
                    <Text type="secondary">{t('mentionHint')}</Text>
                  </Center>
                )}
                {detail.messages.map((message) => (
                  <Message
                    detail={detail}
                    key={message.id}
                    message={message}
                    onThread={openThread}
                  />
                ))}
                <div ref={end} />
              </div>
            </div>
            {actionError !== undefined && <AsyncError error={actionError} variant="inline" />}
            {detail.channel.archived ? (
              <Center padding={24}>{t('archived')}</Center>
            ) : (
              <Composer
                replying={replying}
                members={activeMembers.map((member) => ({
                  id: member.id,
                  name: memberName(member, t('deletedMember')),
                }))}
                onStop={() => void stop()}
                onSend={async (content, mentions, requestKey, fileIds) => {
                  await channelActions.send({
                    channelId,
                    content,
                    mentions,
                    requestKey,
                    fileIds,
                    threadId,
                  });
                  follow.current = true;
                  setBefore(undefined);
                }}
              />
            )}
          </>
        )}
      </AsyncBoundary>
    </section>
  );
};

export default function ChannelConversation() {
  const { channelId, threadId } = useParams<{ channelId: string; threadId?: string }>();
  if (!channelId) return null;
  return (
    <Provider
      key={`${channelId}:${threadId ?? 'main'}`}
      createStore={() =>
        createStore({
          context: { agentId: `channel:${channelId}`, topicId: threadId },
          messages: [],
          skipFetch: true,
        })
      }
    >
      <Timeline channelId={channelId} threadId={threadId} />
    </Provider>
  );
}
