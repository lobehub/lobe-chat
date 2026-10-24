import type { ChannelDetail } from '@lobechat/types';
import { ActionIcon, Avatar, Flexbox, Icon, Text } from '@lobehub/ui';
import * as stylex from '@stylexjs/stylex';
import { GitBranch, X } from 'lucide-react';
import { Activity, useState } from 'react';
import { useTranslation } from 'react-i18next';

import NavHeader from '@/features/NavHeader';
import RightPanel from '@/features/RightPanel';

import { ChannelConversation } from './ChannelConversation';
import { memberAvatar, memberName } from './memberName';
import { styles } from './styles';

/** Below this width the thread floats over the channel instead of sitting beside it. */
export const THREAD_FLOAT_BREAKPOINT = 760;

const ThreadFollowers = ({ detail, threadId }: { detail: ChannelDetail; threadId: string }) => {
  const { t } = useTranslation('channel');
  const { members = [], threads = [] } = detail;
  const followerIds = threads.find((entry) => entry.id === threadId)?.followerMemberIds ?? [];
  const followers = members.filter((member) => member.active && followerIds.includes(member.id));
  const names = followers.map((member) => memberName(member, t('deletedMember'))).join('、');
  return (
    <Flexbox
      horizontal
      align="center"
      aria-label={followers.length ? t('followers', { names }) : t('noFollowers')}
      gap={4}
      title={followers.length ? t('followers', { names }) : t('noFollowers')}
    >
      {followers.slice(0, 3).map((member) => (
        <Avatar
          avatar={memberAvatar(member)}
          key={member.id}
          size={20}
          title={memberName(member, t('deletedMember'))}
        />
      ))}
      <Text fontSize={12} type="secondary">
        {followers.length}
      </Text>
    </Flexbox>
  );
};

export function ThreadPanel({
  availableWidth = 1000,
  detail,
  threadId,
  onClose,
}: {
  availableWidth?: number;
  detail: ChannelDetail;
  onClose: () => void;
  threadId: string | null;
}) {
  const { t } = useTranslation('channel');
  // Keep the last thread mounted while the panel animates closed.
  const [lastThreadId, setLastThreadId] = useState(threadId);
  const [preferredWidth, setPreferredWidth] = useState(520);
  if (threadId && threadId !== lastThreadId) setLastThreadId(threadId);
  const narrow = availableWidth < THREAD_FLOAT_BREAKPOINT;
  const maxWidth = narrow ? availableWidth : availableWidth - 360;
  const width = Math.min(preferredWidth, maxWidth);

  return (
    <RightPanel
      className={stylex.props(styles.threadPanel).className}
      classNames={{ content: stylex.props(styles.threadContent).className }}
      expand={!!threadId}
      maxWidth={maxWidth}
      minWidth={Math.min(360, maxWidth)}
      mode={narrow ? 'float' : 'fixed'}
      showHandleWhenCollapsed={false}
      showHandleWideArea={false}
      width={narrow ? availableWidth : width}
      onExpandChange={(expand) => {
        if (!expand) onClose();
      }}
      onSizeChange={(size) => {
        const next = Number.parseFloat(String(size?.width));
        if (Number.isFinite(next)) setPreferredWidth(next);
      }}
    >
      <Activity mode={threadId ? 'visible' : 'hidden'}>
        <Flexbox aria-label={t('thread')} role="region" {...stylex.props(styles.body)}>
          <NavHeader
            paddingBlock={6}
            paddingInline={8}
            showTogglePanelButton={false}
            left={
              <Flexbox horizontal align="center" gap={8} style={{ marginInlineStart: 4 }}>
                <Icon icon={GitBranch} size={18} />
                <Text ellipsis fontSize={14}>
                  {t('thread')}
                </Text>
              </Flexbox>
            }
            right={
              <Flexbox horizontal align="center" gap={8}>
                {lastThreadId && <ThreadFollowers detail={detail} threadId={lastThreadId} />}
                <ActionIcon
                  aria-label={t('closeThread')}
                  icon={X}
                  size="small"
                  title={t('closeThread')}
                  onClick={onClose}
                />
              </Flexbox>
            }
            {...stylex.props(styles.threadHeader)}
          />
          {lastThreadId && detail.channel && (
            <ChannelConversation
              channelId={detail.channel.id}
              key={lastThreadId}
              threadId={lastThreadId}
            />
          )}
        </Flexbox>
      </Activity>
    </RightPanel>
  );
}
