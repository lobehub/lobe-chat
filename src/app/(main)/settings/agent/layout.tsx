'use client';

import isEqual from 'fast-deep-equal';
import { PropsWithChildren, memo } from 'react';

import { INBOX_SESSION_ID } from '@/const/session';
import StoreUpdater from '@/features/AgentSetting/StoreUpdater';
import { Provider, createStore } from '@/features/AgentSetting/store';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

const Layout = memo(({ children }: PropsWithChildren) => {
  const config = useUserStore(settingsSelectors.defaultAgentConfig, isEqual);
  const meta = useUserStore(settingsSelectors.defaultAgentMeta, isEqual);
  const [updateAgent] = useUserStore((s) => [s.updateDefaultAgent]);

  return (
    <Provider createStore={createStore}>
      <StoreUpdater
        config={config}
        id={INBOX_SESSION_ID}
        meta={meta}
        onConfigChange={(config) => {
          updateAgent({ config });
        }}
        onMetaChange={(meta) => {
          updateAgent({ meta });
        }}
      />
      {children}
    </Provider>
  );
});

export default Layout;
