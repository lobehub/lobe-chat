import { Timer, TimerOff } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';

import Action from '../components/Action';
import Controls from './Controls';

const History = memo(() => {
  const [isLoading] = useAgentStore((s) => [agentSelectors.isAgentConfigLoading(s)]);
  const [updating, setUpdating] = useState(false);
  const { t } = useTranslation('setting');

  const [historyCount, enableHistoryCount] = useAgentStore((s) => {
    return [
      agentChatConfigSelectors.historyCount(s),
      agentChatConfigSelectors.enableHistoryCount(s),
    ];
  });

  if (isLoading) return <Action disabled icon={TimerOff} />;

  const title = t(
    enableHistoryCount
      ? 'settingChat.enableHistoryCount.limited'
      : 'settingChat.enableHistoryCount.unlimited',
    { number: historyCount || 0 },
  );

  return (
    <Action
      icon={enableHistoryCount ? Timer : TimerOff}
      loading={updating}
      popover={{
        content: <Controls setUpdating={setUpdating} updating={updating} />,
        minWidth: 240,
      }}
      showTooltip={false}
      title={title}
    />
  );
});

export default History;
