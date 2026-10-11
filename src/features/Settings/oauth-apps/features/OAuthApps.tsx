'use client';

import { Empty, Flexbox } from '@lobehub/ui';
import { Skeleton } from '@lobehub/ui/base-ui';
import { createStaticStyles } from 'antd-style';
import { AppWindowIcon } from 'lucide-react';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import AsyncError from '@/components/AsyncError';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { useClientDataSWR } from '@/libs/swr';
import { authKeys } from '@/libs/swr/keys';
import { lambdaClient } from '@/libs/trpc/client';
import { type OAuthAppItem } from '@/types/oauthApp';

import { resolveAppListState } from '../appList';
import AppDetail from './AppDetail';
import AppItem from './AppItem';
import CreateAppButton from './CreateAppButton';

const styles = createStaticStyles(({ css, cssVar }) => ({
  listCol: css`
    overflow: hidden;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};
    background: ${cssVar.colorBgContainer};
  `,
}));

interface OAuthAppsProps {
  canEdit: boolean;
}

const OAuthApps: FC<OAuthAppsProps> = ({ canEdit }) => {
  const { t } = useTranslation('auth');
  const navigate = useWorkspaceAwareNavigate();
  const params = useParams<{ sub?: string }>();

  const {
    data: apps,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useClientDataSWR(authKeys.oauthAppList(), async () => {
    const list = await lambdaClient.oauthApp.list.query();
    return list as OAuthAppItem[];
  });

  const reload = () => mutate();

  if (params.sub)
    return (
      <AppDetail
        canEdit={canEdit}
        id={params.sub}
        key={params.sub}
        onBack={() => navigate('/settings/oauth-apps')}
        onChanged={reload}
      />
    );

  const listState = resolveAppListState({ count: apps?.length, error, isLoading });

  if (listState === 'error')
    return <AsyncError error={error} retrying={isValidating} variant={'block'} onRetry={reload} />;

  const renderRows = () => {
    if (listState === 'loading')
      return (
        <Flexbox gap={12} padding={12}>
          <Skeleton.Text rows={2} />
          <Skeleton.Text rows={2} />
        </Flexbox>
      );

    if (listState === 'empty' || !apps)
      return (
        <Empty
          action={canEdit && <CreateAppButton secondary />}
          description={t('oauthApp.list.empty')}
          icon={AppWindowIcon}
          style={{ paddingBlock: 40 }}
        />
      );

    return apps.map((app) => (
      <AppItem
        app={app}
        canEdit={canEdit}
        key={app.id}
        onChanged={reload}
        onDeleted={reload}
        onOpen={() => navigate(`/settings/oauth-apps/${app.id}`)}
      />
    ));
  };

  return (
    <Flexbox className={styles.listCol} gap={2} padding={4}>
      {renderRows()}
    </Flexbox>
  );
};

export default OAuthApps;
