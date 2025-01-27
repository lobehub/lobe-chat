'use client';

import { Skeleton } from 'antd';
import isEqual from 'fast-deep-equal';
import dynamic from 'next/dynamic';
import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import ModalLayout from '@/app/@modal/_layout/ModalLayout';
import StoreUpdater from '@/features/AgentSetting/StoreUpdater';
import { Provider, createStore } from '@/features/AgentSetting/store';
import { useChatSettingsTab } from '@/hooks/useChatSettingsTab';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

import SettingModalLayout from '../../../_layout/SettingModalLayout';

const CategoryContent = dynamic(() => import('./features/CategoryContent'), {
  loading: () => <Skeleton paragraph={{ rows: 6 }} title={false} />,
  ssr: false,
});

const Layout = memo<PropsWithChildren>(({ children }) => {
  const tab = useChatSettingsTab();
  const { t } = useTranslation('setting');
  const id = useSessionStore((s) => s.activeId);
  const config = useAgentStore(agentSelectors.currentAgentConfig, isEqual);
  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);
  const [updateAgentConfig] = useAgentStore((s) => [s.updateAgentConfig]);
  const [updateAgentMeta] = useSessionStore((s) => [
    s.updateSessionMeta,
    sessionMetaSelectors.currentAgentTitle(s),
  ]);

  return (
    <ModalLayout>
      <SettingModalLayout
        activeTitle={t(`agentTab.${tab as ChatSettingsTabs}`)}
        category={<CategoryContent />}
        desc={t('header.sessionDesc')}
        title={t('header.session')}
      >
        <Provider createStore={createStore}>
          <StoreUpdater
            config={config}
            id={id}
            meta={meta}
            onConfigChange={updateAgentConfig}
            onMetaChange={updateAgentMeta}
          />
          {children}
        </Provider>
      </SettingModalLayout>
    </ModalLayout>
  );
});

export default Layout;
