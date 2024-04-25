import { ActionIcon, SliderWithInput } from '@lobehub/ui';
import { Popover, Switch } from 'antd';
import { Timer, TimerOff } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

const History = memo(() => {
  const { t } = useTranslation('setting');

  const [historyCount, unlimited, updateAgentConfig] = useAgentStore((s) => {
    const config = agentSelectors.currentAgentConfig(s);
    return [config.historyCount, !config.enableHistoryCount, s.updateAgentConfig];
  });

  return (
    <Popover
      arrow={false}
      content={
        <Flexbox align={'center'} gap={16} horizontal>
          <SliderWithInput
            disabled={unlimited}
            max={30}
            min={1}
            onChange={(v) => {
              updateAgentConfig({ historyCount: v });
            }}
            step={1}
            style={{ width: 160 }}
            value={historyCount}
          />
          <Flexbox align={'center'} gap={4} horizontal>
            <Switch
              checked={unlimited}
              onChange={(checked) => {
                updateAgentConfig({ enableHistoryCount: !checked });
              }}
              size={'small'}
            />
            {t('settingChat.enableHistoryCount.alias')}
          </Flexbox>
        </Flexbox>
      }
      placement={'top'}
      trigger={'click'}
    >
      <ActionIcon
        icon={unlimited ? TimerOff : Timer}
        placement={'bottom'}
        title={t(
          unlimited
            ? 'settingChat.enableHistoryCount.unlimited'
            : 'settingChat.enableHistoryCount.limited',
          { number: historyCount || 0 },
        )}
      />
    </Popover>
  );
});

export default History;
