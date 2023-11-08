import { ActionIcon, SliderWithInput } from '@lobehub/ui';
import { Dropdown, Popover, Switch } from 'antd';
import { BrainCog, Thermometer, Timer, TimerOff } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { LanguageModel } from '@/types/llm';

const ActionLeft = memo(() => {
  const { t } = useTranslation('setting');

  const [model, temperature, historyCount, unlimited, updateAgentConfig] = useSessionStore((s) => {
    const config = agentSelectors.currentAgentConfig(s);
    return [
      config.model,
      config.params.temperature,
      config.historyCount,
      !config.enableHistoryCount,
      s.updateAgentConfig,
    ];
  });

  const modelList = useGlobalStore(settingsSelectors.modelList);

  return (
    <>
      <Dropdown
        menu={{
          activeKey: model,
          items: modelList.map((i) => ({ key: i, label: i })),
          onClick: (e) => {
            updateAgentConfig({ model: e.key as LanguageModel });
          },
          style: {
            maxHeight: 400,
            overflow: 'scroll',
          },
        }}
        trigger={['click']}
      >
        <ActionIcon icon={BrainCog} placement={'bottom'} title={t('settingModel.model.title')} />
      </Dropdown>
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
    </>
  );
});

export default ActionLeft;
