import type { ChannelDetail, ChannelPublicMessage } from '@lobechat/types';
import { ActionIcon, Button, Divider, Empty, Flexbox, Icon } from '@lobehub/ui';
import * as stylex from '@stylexjs/stylex';
import { GitBranch, MessageSquare } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncBoundary from '@/components/AsyncBoundary';
import AsyncError from '@/components/AsyncError';
import CollapsibleContent from '@/components/CollapsibleContent';
import { ChatItem } from '@/features/Conversation/ChatItem';
import Markdown from '@/features/Conversation/Markdown';
import { createStore, Provider } from '@/features/Conversation/store';
import WideScreenContainer from '@/features/WideScreenContainer';
import { channelService } from '@/services/channel';
import { channelActions, channelSelectors, useChannelStore } from '@/store/channel';

import { visibleChannelDetail } from './channelAccess';
import { Composer } from './Composer';
import { isChannelJobActive } from './jobStatus';
import { authorAvatar, memberName } from './memberName';
import { MessageAttachments } from './MessageAttachments';
import { MessageReceipts } from './MessageReceipts';
import { styles } from './styles';
import { useChannelEvents } from './useChannelEvents';

interface ChannelConversationProps {
  channelId: string;
  /** Mounted beside a thread panel that covers it, so keep it out of the tab order. */
  inert?: boolean;
  onOpenThread?: (threadId: string) => void;
  threadId?: string | null;
}

const ChannelMessage = ({
  detail,
  message,
  isRoot,
  threadId,
  onOpenThread,
}: {
  detail: ChannelDetail;
  isRoot?: boolean;
  message: ChannelPublicMessage;
  onOpenThread?: (threadId: string) => void;
  threadId?: string | null;
}) => {
  const { t } = useTranslation('channel');
  const [branching, setBranching] = useState(false);
  const [error, setError] = useState<unknown>();
  // Inside a thread, its root and replies link nowhere else.
  const thread =
    !threadId && !isRoot && detail.threads.find((entry) => entry.rootMessageId === message.id);
  const canBranch = !threadId && !isRoot && !thread && !detail.channel.archived && !!onOpenThread;
  const branch = async () => {
    setBranching(true);
    setError(undefined);
    try {
      const { data } = await channelService.createThread(
        detail.channel.id,
        message.id,
        message.recipientMemberIds,
      );
      await channelActions.refreshDetail({ channelId: detail.channel.id });
      onOpenThread?.(data.id);
    } catch (cause) {
      console.error('Failed to start Channel thread', cause);
      setError(cause);
    } finally {
      setBranching(false);
    }
  };

  return (
    <div data-message-id={message.id} {...stylex.props(styles.messageRow, stylex.defaultMarker())}>
      <ChatItem
        showAvatar
        showTitle
        avatarProps={{ size: 36 }}
        gap={4}
        id={message.id}
        paddingBlock={12}
        placement="left"
        style={{ paddingInlineStart: 48 }}
        time={new Date(message.createdAt).getTime()}
        actionAddon={
          thread ? (
            <Button
              icon={GitBranch}
              size="small"
              type="text"
              onClick={() => onOpenThread?.(thread.id)}
            >
              {t('openThread')}
            </Button>
          ) : undefined
        }
        avatar={{
          avatar: authorAvatar(message.author),
          title: message.author.name || t('deletedMember'),
        }}
        belowMessage={
          <>
            {message.author.type === 'user' && !isRoot && (
              <MessageReceipts detail={detail} message={message} />
            )}
            {error !== undefined && <AsyncError error={error} variant="inline" />}
          </>
        }
        customAvatarRender={(_, avatar) => (
          <Flexbox {...stylex.props(styles.messageAvatar)}>{avatar}</Flexbox>
        )}
        message={
          <CollapsibleContent key={message.id}>
            <Flexbox gap={8}>
              {message.fileIds.length > 0 && (
                <MessageAttachments attachments={detail.attachments} fileIds={message.fileIds} />
              )}
              {message.content && <Markdown>{message.content}</Markdown>}
            </Flexbox>
          </CollapsibleContent>
        }
      />
      {canBranch && (
        <ActionIcon
          aria-label={t('startThread')}
          icon={GitBranch}
          loading={branching}
          size="small"
          title={t('startThread')}
          onClick={() => void branch()}
          {...stylex.props(styles.branchAction)}
        />
      )}
    </div>
  );
};

const Timeline = ({
  channelId,
  inert,
  threadId = null,
  onOpenThread,
}: ChannelConversationProps) => {
  const { t } = useTranslation('channel');
  const [before, setBefore] = useState<number>();
  const [actionError, setActionError] = useState<unknown>();
  const params = { before, channelId, threadId };
  const sync = channelActions.useFetchDetail(params);
  const cached = useChannelStore(channelSelectors.detail(params));
  const detail = visibleChannelDetail(cached, sync.error);
  const feedRef = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const lastMessageId = detail?.messages.at(-1)?.id;
  const sequence = detail?.channel.sequence;
  useChannelEvents(params);

  useEffect(() => {
    const feed = feedRef.current;
    if (feed && followLatest.current && before === undefined) feed.scrollTop = feed.scrollHeight;
  }, [lastMessageId, before]);

  useEffect(() => {
    if (threadId || sequence === undefined || before !== undefined) return;
    void channelService
      .markRead(channelId, sequence)
      .catch((error: unknown) => console.error('Failed to mark Channel read', error));
  }, [channelId, threadId, sequence, before]);

  const stop = async () => {
    setActionError(undefined);
    try {
      await channelActions.stop(channelId, { threadId });
    } catch (cause) {
      console.error('Failed to stop Channel replies', cause);
      setActionError(cause);
    }
  };

  const activeMembers = detail?.members.filter((member) => member.active) ?? [];
  const replying = detail?.jobs.some(
    (job) => (job.threadId ?? null) === threadId && isChannelJobActive(job),
  );

  return (
    <Flexbox
      data-channel-conversation={threadId || 'main'}
      inert={inert}
      {...stylex.props(styles.body)}
    >
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
            <Flexbox
              aria-label={t(threadId ? 'thread' : 'main')}
              justify={!threadId && !detail.messages.length ? 'center' : undefined}
              ref={feedRef}
              onScroll={(event) => {
                const feed = event.currentTarget;
                followLatest.current = feed.scrollHeight - feed.scrollTop - feed.clientHeight < 64;
              }}
              {...stylex.props(styles.feed)}
            >
              <WideScreenContainer fullWidth paddingInline={24}>
                {(detail.hasMore || before !== undefined) && (
                  <Flexbox horizontal align="center" gap={8} justify="center" paddingBlock={8}>
                    <Button
                      disabled={!detail.hasMore}
                      size="small"
                      onClick={() => setBefore(detail.messages[0]?.sequence)}
                    >
                      {t('olderMessages')}
                    </Button>
                    {before !== undefined && (
                      <Button
                        size="small"
                        type="text"
                        onClick={() => {
                          followLatest.current = true;
                          setBefore(undefined);
                        }}
                      >
                        {t('latestMessages')}
                      </Button>
                    )}
                  </Flexbox>
                )}
                {detail.rootMessage && (
                  <Flexbox>
                    <ChannelMessage isRoot detail={detail} message={detail.rootMessage} />
                    <Divider>
                      <Flexbox horizontal align="center" gap={6} {...stylex.props(styles.muted)}>
                        <Icon icon={GitBranch} size={12} />
                        {t('threadDivider')}
                      </Flexbox>
                    </Divider>
                  </Flexbox>
                )}
                {!detail.messages.length &&
                  (threadId ? (
                    <p {...stylex.props(styles.muted)}>{t('threadEmpty')}</p>
                  ) : (
                    <Empty
                      description={t('mentionHint')}
                      icon={MessageSquare}
                      title={t('conversationEmpty')}
                    />
                  ))}
                {detail.messages.map((message) => (
                  <ChannelMessage
                    detail={detail}
                    key={message.id}
                    message={message}
                    threadId={threadId}
                    onOpenThread={onOpenThread}
                  />
                ))}
              </WideScreenContainer>
            </Flexbox>
            {actionError !== undefined && (
              <WideScreenContainer fullWidth paddingInline={24}>
                <AsyncError error={actionError} variant="inline" />
              </WideScreenContainer>
            )}
            {detail.channel.archived ? (
              <WideScreenContainer fullWidth paddingInline={24}>
                <Flexbox role="status" {...stylex.props(styles.activity)}>
                  {t('archived')}
                </Flexbox>
              </WideScreenContainer>
            ) : (
              <Composer
                key={`${channelId}:${threadId || 'main'}`}
                placeholder={t(threadId ? 'threadComposer' : 'composer')}
                replying={replying}
                members={activeMembers.map((member) => ({
                  id: member.id,
                  name: memberName(member, t('deletedMember')),
                }))}
                onStop={() => void stop()}
                onSend={async (content, mentions, requestKey, fileIds) => {
                  followLatest.current = true;
                  await channelActions.send({
                    channelId,
                    content,
                    fileIds,
                    mentions,
                    requestKey,
                    threadId,
                  });
                  setBefore(undefined);
                }}
              />
            )}
          </>
        )}
      </AsyncBoundary>
    </Flexbox>
  );
};

/** Each mounted conversation owns its editor, scroll position and execution scope. */
export function ChannelConversation(props: ChannelConversationProps) {
  const { channelId, threadId } = props;
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
      <Timeline {...props} />
    </Provider>
  );
}
