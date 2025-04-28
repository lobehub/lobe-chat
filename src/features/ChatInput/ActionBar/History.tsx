import { ActionIcon, SliderWithInput } from '@lobehub/ui';
import { Switch } from 'antd';
import { Timer, TimerOff } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';

import ActionPopover from '../components/ActionPopover';

const History = memo(() => {
  const { t } = useTranslation('setting');
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [historyCount, enableHistoryCount, updateAgentConfig] = useAgentStore((s) => {
    return [
      agentChatConfigSelectors.historyCount(s),
      agentChatConfigSelectors.enableHistoryCount(s),
      s.updateAgentChatConfig,
    ];
  });

  const title = t(
    enableHistoryCount
      ? 'settingChat.enableHistoryCount.limited'
      : 'settingChat.enableHistoryCount.unlimited',
    { number: historyCount || 0 },
  );

  return (
    <ActionPopover
      arrow={false}
      content={
        <SliderWithInput
          disabled={!enableHistoryCount}
          max={20}
          min={0}
          onChange={async (v) => {
            setLoading(true);
            await updateAgentConfig({ historyCount: v });
            setLoading(false);
          }}
          size={'small'}
          step={1}
          value={historyCount}
        />
      }
      extra={
        <Switch
          checked={enableHistoryCount}
          loading={loading}
          onChange={async (enableHistoryCount) => {
            setLoading(true);
            await updateAgentConfig({ enableHistoryCount });
            setLoading(false);
          }}
          size={'small'}
        />
      }
      minWidth={240}
      onOpenChange={setPopoverOpen}
      open={popoverOpen}
      title={t('settingChat.enableHistoryCount.title')}
    >
      <ActionIcon
        icon={enableHistoryCount ? Timer : TimerOff}
        title={title}
        tooltipProps={{
          placement: 'bottom',
        }}
      />
    </ActionPopover>
  );
});

export default History;
