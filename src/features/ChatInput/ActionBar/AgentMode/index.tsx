import { ActionIcon } from '@lobehub/ui';
import { Bot } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

const AgentModeToggle = memo(() => {
  const { t } = useTranslation('chat');
  const [enableAgentMode, updateAgentConfig] = useAgentStore((s) => [
    agentSelectors.enableAgentMode(s),
    s.updateAgentConfig,
  ]);

  const handleToggle = (checked: boolean) => {
    updateAgentConfig({ enableAgentMode: checked });
  };

  return (
    <ActionIcon
      icon={Bot}
      onClick={() => {
        handleToggle(!enableAgentMode);
      }}
      style={{
        color: enableAgentMode ? 'var(--colorPrimary)' : undefined,
      }}
      title={t('agentMode.title', { defaultValue: 'Agent Mode' })}
    />
  );
});

AgentModeToggle.displayName = 'AgentModeToggle';

export default AgentModeToggle;
