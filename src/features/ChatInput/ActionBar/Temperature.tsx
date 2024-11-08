import { ActionIcon, SliderWithInput } from '@lobehub/ui';
import { Popover } from 'antd';
import { Thermometer } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

const Temperature = memo(() => {
  const { t } = useTranslation('setting');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [temperature, updateAgentConfig] = useAgentStore((s) => {
    const config = agentSelectors.currentAgentConfig(s);
    return [config.params?.temperature, s.updateAgentConfig];
  });

  const title = t('settingModel.temperature.titleWithValue', { value: temperature });

  return (
    <Popover
      arrow={false}
      content={
        <SliderWithInput
          controls={false}
          max={2}
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
      onOpenChange={setPopoverOpen}
      open={popoverOpen}
      placement={'top'}
      title={t('settingModel.temperature.title')}
      trigger={'click'}
    >
      <ActionIcon icon={Thermometer} placement={'bottom'} title={popoverOpen ? undefined : title} />
    </Popover>
  );
});

export default Temperature;
