import type { ChannelDetail } from '@lobechat/types';
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionRoot,
  AccordionTrigger,
  ActionIcon,
  copyToClipboard,
  DropdownMenu,
  Flexbox,
  Text,
  toast,
} from '@lobehub/ui';
import { Copy, GitBranch, Hash, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useActiveWorkspaceSlug } from '@/business/client/hooks/useActiveWorkspaceSlug';
import AsyncError from '@/components/AsyncError';
import EmptyNavItem from '@/features/NavPanel/components/EmptyNavItem';
import NavItem from '@/features/NavPanel/components/NavItem';
import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { buildWorkspaceAwarePath } from '@/features/Workspace/workspaceAwarePath';
import { useActiveLocation } from '@/hooks/useActiveLocation';
import { useActiveRouteParams } from '@/hooks/useActiveRouteParams';
import { channelActions, channelSelectors, useChannelStore } from '@/store/channel';

import { openCreateChannel } from '../CreateChannel';
import { groupChannelPath, matchGroupChannel } from '../paths';
import { useChannelEvents } from '../useChannelEvents';

const THREAD_TITLE_LENGTH = 60;

/** A thread is named after the message it branched from, when that message is loaded. */
const threadTitle = (detail: ChannelDetail, rootMessageId: string) => {
  const root = detail.messages.find((message) => message.id === rootMessageId);
  const line = root?.content.trim().split('\n')[0];
  return line ? line.slice(0, THREAD_TITLE_LENGTH) : undefined;
};

const ChannelThreads = ({
  channelId,
  groupId,
  threadId,
}: {
  channelId: string;
  groupId: string;
  threadId: string | null;
}) => {
  const { t } = useTranslation('channel');
  const navigate = useWorkspaceAwareNavigate();
  const slug = useActiveWorkspaceSlug();
  // The open Channel's page already loads this view; the sidebar only reads it.
  const detail = useChannelStore(channelSelectors.detail({ channelId, threadId: null }));
  if (!detail?.threads.length) return null;

  return (
    <Flexbox aria-label={t('thread')} gap={1} paddingBlock={1} style={{ paddingInlineStart: 20 }}>
      {detail.threads.map((thread, index) => {
        const path = groupChannelPath(groupId, channelId, thread.id);
        const active = thread.id === threadId;
        return (
          <NavItem
            active={active}
            aria-current={active ? 'page' : undefined}
            href={buildWorkspaceAwarePath(path, slug)}
            icon={GitBranch}
            iconSize={14}
            key={thread.id}
            title={threadTitle(detail, thread.rootMessageId) || `${t('thread')} ${index + 1}`}
            onClick={() => navigate(path)}
          />
        );
      })}
    </Flexbox>
  );
};

/** The Channel tab of an Agent group sidebar, with the open Channel's threads nested under it. */
const ChannelList = () => {
  const { t } = useTranslation('channel');
  const { gid } = useActiveRouteParams();
  const { pathname, search } = useActiveLocation();
  const navigate = useWorkspaceAwareNavigate();
  const slug = useActiveWorkspaceSlug();
  const sync = channelActions.useFetchList();
  const channels = useChannelStore(channelSelectors.list);
  useChannelEvents();
  if (!gid) return null;

  const activeChannelId = matchGroupChannel(pathname);
  const activeThreadId = new URLSearchParams(search).get('thread');
  const menuItems = (id: string) => [
    {
      icon: Copy,
      key: 'copyId',
      label: t('copyId'),
      onClick: async () => {
        try {
          await copyToClipboard(id);
          toast.success(t('copyIdSuccess'));
        } catch (error) {
          console.error('Failed to copy Channel id', error);
          toast.error(t('actionFailed'));
        }
      },
    },
  ];

  return (
    <Flexbox paddingInline={4}>
      <AccordionRoot defaultValue={['channels']} indicatorPlacement="inline">
        <AccordionItem value="channels">
          <AccordionHeader>
            <AccordionTrigger style={{ paddingBlock: 4, paddingInline: '8px 4px' }}>
              <Text ellipsis fontSize={12} type="secondary" weight={500}>
                {`${t('title')} ${channels?.length || ''}`}
              </Text>
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel contentStyle={{ padding: 0 }}>
            <Flexbox gap={1} paddingBlock={1}>
              {!channels && !sync.error && <SkeletonList rows={3} />}
              {!!sync.error && (
                <AsyncError
                  error={sync.error}
                  variant="inline"
                  onRetry={() => void channelActions.refreshList()}
                />
              )}
              {channels?.length === 0 && (
                <EmptyNavItem
                  title={t('create')}
                  onClick={() =>
                    openCreateChannel({ onCreated: (id) => navigate(groupChannelPath(gid, id)) })
                  }
                />
              )}
              {channels?.map((channel) => {
                const path = groupChannelPath(gid, channel.id);
                const open = activeChannelId === channel.id;
                return (
                  <Flexbox key={channel.id}>
                    <NavItem
                      active={open && !activeThreadId}
                      aria-current={open && !activeThreadId ? 'page' : undefined}
                      contextMenuItems={() => menuItems(channel.id)}
                      data-channel-id={channel.id}
                      href={buildWorkspaceAwarePath(path, slug)}
                      icon={Hash}
                      title={channel.title}
                      actions={() => (
                        <DropdownMenu items={menuItems(channel.id)}>
                          <ActionIcon
                            icon={MoreHorizontal}
                            size="small"
                            title={t('more', { ns: 'common' })}
                          />
                        </DropdownMenu>
                      )}
                      onClick={() => navigate(path)}
                    />
                    {open && (
                      <ChannelThreads
                        channelId={channel.id}
                        groupId={gid}
                        threadId={activeThreadId}
                      />
                    )}
                  </Flexbox>
                );
              })}
            </Flexbox>
          </AccordionPanel>
        </AccordionItem>
      </AccordionRoot>
    </Flexbox>
  );
};

export default ChannelList;
