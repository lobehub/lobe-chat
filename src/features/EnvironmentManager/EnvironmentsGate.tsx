'use client';

import { Button, Center, Empty, Flexbox } from '@lobehub/ui';
import { AlertTriangleIcon } from 'lucide-react';
import { memo, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { SandboxStorageUpgradeGuide } from '@/business/client/features/SandboxStorageUpsell';
import { RouteLoading } from '@/components/Skeleton/RouteSegment';
import { sandboxActions, sandboxSelectors, useSandboxStore } from '@/store/sandbox';

/**
 * Environments are specifications for a persistent workspace, so the page
 * that manages them is only useful to an account that has one. Without the
 * entitlement the page shows how to get one instead of a form whose result
 * nothing could ever run in.
 *
 * The entitlement is resolved and signed server-side; asking the server is the
 * only way to see the same answer the sandbox will act on. The same replica
 * entry as the composer's working-directory chip — partitioned by workspace,
 * since the server resolves the answer from the active one — so the two never
 * disagree.
 */
const EnvironmentsGate = memo<PropsWithChildren>(({ children }) => {
  const { t } = useTranslation('setting');
  const { error, revalidate } = sandboxActions.useFetchEntitlement(true);
  const data = useSandboxStore(sandboxSelectors.entitlement);

  // A failed lookup is not an unentitled account, and it is not a slow one
  // either: left as a spinner this page is indistinguishable from loading
  // until someone thinks to reload. Say so, and offer the retry.
  if (error && !data)
    return (
      <Center style={{ minHeight: 320 }} width={'100%'}>
        <Flexbox align={'center'} gap={12}>
          <Empty
            description={t('environments.loadFailed.desc')}
            descriptionProps={{ fontSize: 13 }}
            icon={AlertTriangleIcon}
            style={{ maxWidth: 400 }}
            title={t('environments.loadFailed.title')}
          />
          <Button onClick={() => void revalidate()}>{t('environments.loadFailed.retry')}</Button>
        </Flexbox>
      </Center>
    );

  // Nothing rather than a flash of the upgrade page at a user who turns out to
  // be entitled.
  if (!data) return <RouteLoading />;
  if (!data.entitled) return <SandboxStorageUpgradeGuide />;

  return children;
});

EnvironmentsGate.displayName = 'EnvironmentsGate';

export default EnvironmentsGate;
