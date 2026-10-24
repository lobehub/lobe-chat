import type { ChannelDetail } from '@lobechat/types';
import { ActionIcon, Avatar, Button, Flexbox, Popover, Text } from '@lobehub/ui';
import * as stylex from '@stylexjs/stylex';
import { ExternalLink, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';

import { ChannelStatus } from './ChannelStatus';
import { openCreateChannel } from './CreateChannel';
import { channelJobStatus, channelJobTone, memberCurrentJob } from './jobStatus';
import { memberAvatar, memberName } from './memberName';
import { statusStyles, styles, toneStyles } from './styles';

/** Every active member as an avatar with a live status dot; click for what it is doing. */
export function MemberStatus({ detail }: { detail: ChannelDetail }) {
  const { t } = useTranslation('channel');
  const navigate = useWorkspaceAwareNavigate();
  const [openMemberId, setOpenMemberId] = useState<string>();
  const { channel, jobs = [], members: allMembers = [] } = detail;
  const members = allMembers.filter((member) => member.active);

  return (
    <Flexbox horizontal align="center" aria-label={t('membersTitle')} gap={4}>
      {members.map((member) => {
        const name = memberName(member, t('deletedMember'));
        const avatar = memberAvatar(member);
        const job = member.actorType === 'agent' ? memberCurrentJob(jobs, member.id) : undefined;
        const tone = job ? channelJobTone(job) : 'quiet';
        const label = t(job ? channelJobStatus(job) : 'status.idle');
        return (
          <Popover
            key={member.id}
            open={openMemberId === member.id}
            placement="bottomRight"
            trigger="click"
            content={
              <Flexbox gap={12} {...stylex.props(statusStyles.popover)}>
                <Flexbox horizontal align="center" gap={8}>
                  <Avatar avatar={avatar} size={28} title={name} />
                  <Text ellipsis weight={500}>
                    {name}
                  </Text>
                </Flexbox>
                {member.actorType === 'agent' ? (
                  <ChannelStatus label={label} tone={tone} />
                ) : (
                  <span {...stylex.props(styles.muted)}>{t('person')}</span>
                )}
                {member.agentId && (
                  <Flexbox horizontal>
                    <Button
                      icon={ExternalLink}
                      size="small"
                      type="text"
                      onClick={() => {
                        setOpenMemberId(undefined);
                        navigate(`/agent/${member.agentId}`);
                      }}
                    >
                      {t('openAgent')}
                    </Button>
                  </Flexbox>
                )}
              </Flexbox>
            }
            onOpenChange={(open) => setOpenMemberId(open ? member.id : undefined)}
          >
            <Button
              size="small"
              type="text"
              aria-label={
                member.actorType === 'agent'
                  ? t('receipt.memberLabel', { name, state: label })
                  : name
              }
              {...stylex.props(statusStyles.memberButton)}
            >
              <Avatar avatar={avatar} size={24} title={name} />
              {member.actorType === 'agent' && (
                <span
                  aria-hidden
                  {...stylex.props(statusStyles.state, statusStyles.memberDot, toneStyles[tone])}
                >
                  <span {...stylex.props(statusStyles.dot)} />
                </span>
              )}
            </Button>
          </Popover>
        );
      })}
      {channel && !channel.archived && (
        <ActionIcon
          aria-label={t('addMembers')}
          icon={Plus}
          size="small"
          title={t('addMembers')}
          onClick={() =>
            openCreateChannel({
              existing: {
                agentIds: members.flatMap((member) => (member.agentId ? [member.agentId] : [])),
                id: channel.id,
                title: channel.title,
              },
            })
          }
        />
      )}
    </Flexbox>
  );
}
