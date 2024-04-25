import { ActionIcon, SliderWithInput } from '@lobehub/ui';
import { Popover } from 'antd';
import { Thermometer } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

const Temperature = memo(() => {
  const { t } = useTranslation('setting');

  const [temperature, updateAgentConfig] = useAgentStore((s) => {
    const config = agentSelectors.currentAgentConfig(s);
    return [config.params.temperature, s.updateAgentConfig];
  });

  return (
    <Popover
      arrow={false}
      content={
        <SliderWithInput
          controls={false}
          max={1}
          min={0}
          onChange={(v) => {
            updateAgentConfig({ params: { temperature: v } });
          }}
          size={'small'}
          step={0.1}
          style={{ width: 160 }}
          value={temperature}
        />
      }
      placement={'top'}
      trigger={'click'}
    >
      <ActionIcon
        icon={Thermometer}
        placement={'bottom'}
        title={t('settingModel.temperature.titleWithValue', { value: temperature })}
      />
    </Popover>
  );
});

export default Temperature;
