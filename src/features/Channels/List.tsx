import { Button, Center, Flexbox, Icon, Text } from '@lobehub/ui';
import * as stylex from '@stylexjs/stylex';
import { Hash, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import AsyncBoundary from '@/components/AsyncBoundary';
import AsyncError from '@/components/AsyncError';
import NavItem from '@/features/NavPanel/components/NavItem';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { channelActions, channelSelectors, useChannelStore } from '@/store/channel';

import { openCreateChannel } from './CreateChannelModal';
import { styles } from './styles';
import { useChannelEvents } from './useChannelEvents';

export default function ChannelList() {
  const { t } = useTranslation('channel');
  const navigate = useWorkspaceAwareNavigate();
  const sync = channelActions.useFetchList();
  const channels = useChannelStore(channelSelectors.list);
  useChannelEvents();
  const create = () => openCreateChannel((id) => navigate(`/channels/${id}`));
  return (
    <section {...stylex.props(styles.page)}>
      <Flexbox horizontal align="center" justify="space-between" padding={24}>
        <h1 {...stylex.props(styles.heading)}>{t('title')}</h1>
        <Button icon={Plus} type="primary" onClick={create}>
          {t('create')}
        </Button>
      </Flexbox>
      <AsyncBoundary
        data={channels}
        error={sync.error}
        isEmpty={!sync.error && channels?.length === 0}
        isLoading={!channels && !sync.error}
        empty={
          <Center flex={1} gap={16} padding={32}>
            <Icon icon={Hash} size={40} />
            <Text as="h2">{t('emptyTitle')}</Text>
            <Text type="secondary">{t('emptyDescription')}</Text>
            <Button icon={Plus} onClick={create}>
              {t('create')}
            </Button>
          </Center>
        }
        onRetry={() => void channelActions.refreshList()}
      >
        <Flexbox gap={8} paddingInline={24}>
          {!!sync.error && (
            <AsyncError
              error={sync.error}
              variant="inline"
              onRetry={() => void channelActions.refreshList()}
            />
          )}
          {channels?.map((channel) => (
            <NavItem
              icon={Hash}
              key={channel.id}
              title={channel.title}
              onClick={() => navigate(`/channels/${channel.id}`)}
            />
          ))}
        </Flexbox>
      </AsyncBoundary>
    </section>
  );
}
