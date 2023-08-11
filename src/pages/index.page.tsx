import { Icon } from '@lobehub/ui';
import { useWhyDidYouUpdate } from 'ahooks';
import { Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import { sessionSelectors, useSessionHydrated, useSessionStore } from '@/store/session';

import Chat from './chat/index.page';
import Welcome from './welcome/index.page';

const Loading = memo(() => {
  const { t } = useTranslation('common');

  return (
    <Center gap={12} height={'100vh'} width={'100%'}>
      <Icon icon={Loader2} size={{ fontSize: 64 }} spin />
      {t('appInitializing')}
    </Center>
  );
});

export default memo(() => {
  const hydrated = useSessionHydrated();
  const hasSession = useSessionStore(sessionSelectors.hasSessionList);

  useWhyDidYouUpdate('index.page', { hasSession, hydrated });

  if (!hydrated) return <Loading />;

  return !hasSession ? <Welcome /> : <Chat />;
});
