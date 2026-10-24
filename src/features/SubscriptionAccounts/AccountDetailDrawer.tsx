'use client';

import { DEFAULT_AVATAR } from '@lobechat/const';
import { Avatar, Drawer, Empty, Flexbox, Text } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import SkeletonBar from '@/components/Skeleton/Bar';
import QuotaCalendar from '@/features/AgentQuotaCalendar/QuotaCalendarModal';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { useClientDataSWR } from '@/libs/swr';
import { agentQuotaService } from '@/services/agentQuota';
import type { QuotaAccount } from '@/store/agentQuota';

import { accountDisplayName } from './AccountRow';
import type { SubscriptionProvider } from './accountView';

/** Runs move on quickly; poll while the panel is open so the list stays current. */
const ACTIVE_RUNS_REFRESH_MS = 15_000;

const styles = stylex.create({
  run: {
    paddingBlock: '8px',
    paddingInline: '8px',
    borderRadius: cssVar.borderRadius,
    cursor: 'pointer',
    backgroundColor: { 'default': 'transparent', ':hover': cssVar.colorFillTertiary },
  },
});

type Account = QuotaAccount & { provider: SubscriptionProvider };

const ActiveRuns = ({ accountId }: { accountId: string }) => {
  const { t } = useTranslation('setting');
  const navigate = useWorkspaceAwareNavigate();
  const { data, error, isLoading } = useClientDataSWR(
    ['agentQuota.activeRuns', accountId],
    () => agentQuotaService.listActiveRuns(accountId),
    { refreshInterval: ACTIVE_RUNS_REFRESH_MS },
  );

  if (isLoading)
    return (
      <Flexbox gap={4}>
        <SkeletonBar height={44} />
        <SkeletonBar height={44} />
      </Flexbox>
    );
  if (error && !data)
    return (
      <Text fontSize={13} type={'secondary'}>
        {t('subscriptionAccounts.activeRuns.loadFailed')}
      </Text>
    );
  if (!data?.length)
    return (
      <Text fontSize={13} type={'secondary'}>
        {t('subscriptionAccounts.activeRuns.empty')}
      </Text>
    );

  return (
    <Flexbox gap={2}>
      {data.map((run) => (
        <Flexbox
          horizontal
          align={'center'}
          gap={12}
          key={run.operationId}
          role={'link'}
          tabIndex={0}
          {...stylex.props(styles.run)}
          onClick={() =>
            run.agentId &&
            navigate(run.topicId ? `/agent/${run.agentId}/${run.topicId}` : `/agent/${run.agentId}`)
          }
        >
          <Avatar
            avatar={run.agentAvatar || DEFAULT_AVATAR}
            background={run.agentBackgroundColor ?? undefined}
            size={28}
          />
          <Flexbox flex={1} gap={2} style={{ minWidth: 0 }}>
            <Text ellipsis weight={500}>
              {run.agentTitle || t('subscriptionAccounts.activeRuns.untitledAgent')}
            </Text>
            <Text ellipsis fontSize={12} type={'secondary'}>
              {run.topicTitle || t('subscriptionAccounts.activeRuns.untitledTopic')}
            </Text>
          </Flexbox>
          <Text fontSize={12} style={{ flex: 'none' }} type={'secondary'}>
            {run.status === 'running'
              ? t('subscriptionAccounts.activeRuns.running', {
                  time: dayjs(run.lastTurnAt).fromNow(),
                })
              : t('subscriptionAccounts.activeRuns.waiting')}
          </Text>
        </Flexbox>
      ))}
    </Flexbox>
  );
};

interface AccountDetailDrawerProps {
  account?: Account;
  onClose: () => void;
}

/**
 * The account's side panel: which agents are spending it right now, then its
 * usage history. A side panel rather than a modal keeps the list beside it, so
 * the admin can step through accounts without closing anything.
 */
const AccountDetailDrawer = ({ account, onClose }: AccountDetailDrawerProps) => {
  const { t } = useTranslation('setting');

  return (
    <Drawer
      containerMaxWidth={'100%'}
      open={!!account}
      placement={'right'}
      title={account ? accountDisplayName(account) : undefined}
      width={'min(720px, 92vw)'}
      onClose={onClose}
    >
      {account ? (
        <Flexbox gap={24} paddingBlock={8}>
          <Flexbox gap={8}>
            <Text weight={500}>{t('subscriptionAccounts.activeRuns.title')}</Text>
            <ActiveRuns accountId={account.id} />
          </Flexbox>
          <Flexbox gap={8}>
            <Text weight={500}>{t('subscriptionAccounts.usageTitle')}</Text>
            {account.externalAccountId ? (
              <QuotaCalendar
                externalAccountId={account.externalAccountId}
                provider={account.provider}
              />
            ) : (
              <Empty description={t('subscriptionAccounts.status.noData')} />
            )}
          </Flexbox>
        </Flexbox>
      ) : null}
    </Drawer>
  );
};

export default AccountDetailDrawer;
