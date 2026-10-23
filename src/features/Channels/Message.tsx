import type { ChannelDetail, ChannelPublicMessage } from '@lobechat/types';
import { Button, Flexbox, Tag, Text } from '@lobehub/ui';
import { GitBranch, Square } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncError from '@/components/AsyncError';
import FileIcon from '@/components/FileIcon';
import { ChatItem } from '@/features/Conversation/ChatItem';
import Markdown from '@/features/Conversation/Markdown';
import ImageFileListViewer from '@/features/Conversation/Messages/User/components/ImageFileListViewer';
import { channelActions } from '@/store/channel';

import { channelJobStatus } from './jobStatus';
import { memberName } from './memberName';

export const Message = ({
  detail,
  message,
  onThread,
}: {
  detail: ChannelDetail;
  message: ChannelPublicMessage;
  onThread: (message: ChannelPublicMessage) => Promise<void>;
}) => {
  const { t } = useTranslation('channel');
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<unknown>();
  const author = message.author;
  const jobs = detail.jobs.filter((job) => job.messageId === message.id);
  const thread = detail.threads.find((entry) => entry.rootMessageId === message.id);
  const attachments = message.fileIds.flatMap((id) =>
    detail.attachments.filter((file) => file.id === id),
  );
  const images = attachments.filter((file) => file.fileType.startsWith('image/'));
  const perform = async (key: string, run: () => Promise<void>) => {
    if (busy) return;
    setBusy(key);
    setError(undefined);
    try {
      await run();
    } catch (cause) {
      console.error('Channel message action failed', cause);
      setError(cause);
    } finally {
      setBusy(undefined);
    }
  };
  return (
    <ChatItem
      showTitle
      avatar={{ avatar: author.avatar || undefined, title: author.name || t('deletedMember') }}
      headerAddon={author.type === 'agent' ? <Tag>{t('agent')}</Tag> : undefined}
      id={message.id}
      message={<Markdown>{message.content}</Markdown>}
      time={new Date(message.createdAt).getTime()}
      belowMessage={
        <Flexbox gap={8}>
          {images.length > 0 && (
            <ImageFileListViewer
              items={images.map((file) => ({ id: file.id, alt: file.name, url: file.url }))}
            />
          )}
          {attachments
            .filter((file) => !file.fileType.startsWith('image/'))
            .map((file) => (
              <Button href={file.url} key={file.id} rel="noopener noreferrer" target="_blank">
                <FileIcon fileName={file.name} fileType={file.fileType} size={20} />
                {file.name}
              </Button>
            ))}
          {message.routingStatus === 'pending' && (
            <Text type="secondary">{t('routing.pending')}</Text>
          )}
          {message.routingStatus === 'unassigned' && (
            <Text type="warning">{t('routing.unassigned')}</Text>
          )}
          {jobs.length > 0 && (
            <Flexbox gap={6} role="status">
              {jobs.map((job) => {
                const name = memberName(
                  detail.members.find((member) => member.id === job.memberId),
                  t('unnamedAgent'),
                );
                return (
                  <Flexbox horizontal align="center" gap={8} key={job.id} wrap="wrap">
                    <Text type="secondary">
                      {name} · {t(channelJobStatus(job))}
                    </Text>
                    {!job.publicationRevoked &&
                      (job.status === 'queued' || job.status === 'running') && (
                        <Button
                          disabled={!!busy}
                          icon={Square}
                          loading={busy === job.id}
                          size="small"
                          onClick={() =>
                            void perform(job.id, () =>
                              channelActions.stop(detail.channel.id, { jobId: job.id }),
                            )
                          }
                        >
                          {t('stopReply')}
                        </Button>
                      )}
                  </Flexbox>
                );
              })}
            </Flexbox>
          )}
          {!message.threadId && (
            <Flexbox horizontal>
              <Button
                disabled={!!busy}
                icon={GitBranch}
                loading={busy === 'thread'}
                size="small"
                type="text"
                onClick={() => void perform('thread', () => onThread(message))}
              >
                {t(thread ? 'openThread' : 'startThread')}
              </Button>
            </Flexbox>
          )}
          {error !== undefined && <AsyncError error={error} variant="inline" />}
        </Flexbox>
      }
    />
  );
};
