import type { ChannelDetail, ChannelPublicJob, ChannelPublicMessage } from '@lobechat/types';
import { Avatar, Button, Flexbox, Popover, Text } from '@lobehub/ui';
import * as stylex from '@stylexjs/stylex';
import { ChevronDown, ChevronUp, Square } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncError from '@/components/AsyncError';
import { channelActions } from '@/store/channel';

import { ChannelStatus } from './ChannelStatus';
import { channelJobStatus, channelJobTone, isChannelJobActive } from './jobStatus';
import { memberAvatar, memberName } from './memberName';
import { statusStyles, styles } from './styles';

function ReceiptDetail({
  channelId,
  job,
  name,
  avatar,
}: {
  avatar: string;
  channelId: string;
  job: ChannelPublicJob;
  name: string;
}) {
  const { t } = useTranslation('channel');
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<unknown>();
  const stop = async () => {
    setStopping(true);
    setError(undefined);
    try {
      await channelActions.stop(channelId, { jobId: job.id });
    } catch (cause) {
      console.error('Failed to stop Channel reply', cause);
      setError(cause);
    } finally {
      setStopping(false);
    }
  };
  return (
    <Flexbox gap={12} {...stylex.props(statusStyles.popover)}>
      <Flexbox horizontal align="center" gap={8}>
        <Avatar avatar={avatar} size={28} title={name} />
        <Text ellipsis weight={500}>
          {name}
        </Text>
      </Flexbox>
      <ChannelStatus label={t(channelJobStatus(job))} tone={channelJobTone(job)} />
      {isChannelJobActive(job) && (
        <Flexbox horizontal>
          <Button
            danger
            icon={Square}
            loading={stopping}
            size="small"
            type="text"
            onClick={() => void stop()}
          >
            {t('stopReply')}
          </Button>
        </Flexbox>
      )}
      {error !== undefined && <AsyncError error={error} variant="inline" />}
    </Flexbox>
  );
}

/** Who was asked to reply to a message and how far each reply got. */
export function MessageReceipts({
  detail,
  message,
}: {
  detail: ChannelDetail;
  message: ChannelPublicMessage;
}) {
  const { t } = useTranslation('channel');
  const [expanded, setExpanded] = useState(false);
  const { channel, jobs: allJobs = [], members = [] } = detail;
  const jobs = allJobs.filter((job) => job.messageId === message.id);
  if (!channel) return null;
  if (!jobs.length)
    return message.routingStatus === 'pending' || message.routingStatus === 'unassigned' ? (
      <span {...stylex.props(statusStyles.receipts, styles.muted)}>
        {t(message.routingStatus === 'pending' ? 'routing.pending' : 'routing.unassigned')}
      </span>
    ) : null;

  const receipts = jobs.map((job) => {
    const member = members.find((entry) => entry.id === job.memberId);
    return { avatar: memberAvatar(member), job, name: memberName(member, t('unnamedAgent')) };
  });
  // Finished replies fold into one avatar row so the timeline stays quiet.
  const settled = jobs.every((job) => ['done', 'quiet'].includes(channelJobTone(job)));

  return (
    <Flexbox align="flex-start" gap={4} {...stylex.props(statusStyles.receipts)}>
      {settled && (
        <Button
          aria-expanded={expanded}
          icon={expanded ? ChevronUp : ChevronDown}
          size="small"
          type="text"
          onClick={() => setExpanded((value) => !value)}
        >
          <Flexbox horizontal align="center" gap={4}>
            {receipts.map(({ avatar, job, name }) => (
              <Avatar avatar={avatar} key={job.id} size={16} title={name} />
            ))}
            <span {...stylex.props(styles.muted)}>
              {t('receipt.settled', { count: receipts.length })}
            </span>
          </Flexbox>
        </Button>
      )}
      {(!settled || expanded) && (
        <Flexbox horizontal align="center" gap={4} role="status" wrap="wrap">
          {receipts.map(({ avatar, job, name }) => (
            <Popover
              key={job.id}
              placement="bottomLeft"
              trigger="click"
              content={
                <ReceiptDetail avatar={avatar} channelId={channel.id} job={job} name={name} />
              }
            >
              <Button
                aria-label={t('receipt.memberLabel', { name, state: t(channelJobStatus(job)) })}
                size="small"
                type="text"
                {...stylex.props(statusStyles.chip)}
              >
                <Avatar avatar={avatar} size={18} title={name} />
                <span {...stylex.props(statusStyles.name)}>{name}</span>
                <ChannelStatus label={t(channelJobStatus(job))} tone={channelJobTone(job)} />
              </Button>
            </Popover>
          ))}
        </Flexbox>
      )}
    </Flexbox>
  );
}
