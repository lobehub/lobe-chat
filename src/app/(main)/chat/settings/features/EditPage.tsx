'use client';

import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';
import { AgentSettings } from '@/features/AgentSetting';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

const EditPage = memo(() => {
  const { t } = useTranslation('setting');
  const id = useSessionStore((s) => s.activeId);
  const config = useAgentStore(agentSelectors.currentAgentConfig, isEqual);
  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);
  const [updateAgentConfig] = useAgentStore((s) => [s.updateAgentConfig]);

  const [updateAgentMeta, title] = useSessionStore((s) => [
    s.updateSessionMeta,
    sessionMetaSelectors.currentAgentTitle(s),
  ]);

  return (
    <>
      <PageTitle title={t('header.sessionWithName', { name: title })} />
      <AgentSettings
        config={config}
        id={id}
        meta={meta}
        onConfigChange={updateAgentConfig}
        onMetaChange={updateAgentMeta}
      />
    </>
  );
});

export default EditPage;
