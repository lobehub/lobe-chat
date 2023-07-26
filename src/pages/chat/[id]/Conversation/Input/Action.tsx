import { ActionIcon } from '@lobehub/ui';
import { Dropdown, Popconfirm, Popover } from 'antd';
import { BrainCog, Eraser, Thermometer } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import SliderWithInput from '@/components/SliderWithInput';
import { agentSelectors, useSessionStore } from '@/store/session';
import { LanguageModel } from '@/types/llm';

const InputActions = memo(() => {
  const { t } = useTranslation('setting');
  const [clearMessage, updateAgentConfig] = useSessionStore(
    (s) => [s.clearMessage, s.updateAgentConfig],
    shallow,
  );
  const [model, temperature] = useSessionStore((s) => {
    const config = agentSelectors.currentAgentConfigSafe(s);
    return [
      config.model,
      config.params.temperature,
      // config.historyCount
    ];
  }, shallow);

  return (
    <>
      <Dropdown
        menu={{
          activeKey: model,
          items: Object.values(LanguageModel).map((i) => ({ key: i, label: i })),
          onClick: (e) => {
            updateAgentConfig({ model: e.key as LanguageModel });
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
        trigger={'click'}
      >
        <ActionIcon
          icon={Thermometer}
          placement={'bottom'}
          title={t('settingModel.temperature.titleWithValue', { value: temperature })}
        />
      </Popover>
      {/*TODO 历史记录功能实现 */}
      {/*<Popover*/}
      {/*  content={*/}
      {/*    <SliderWithInput*/}
      {/*      min={0}*/}
      {/*      onChange={(v) => {*/}
      {/*        updateAgentConfig({ historyCount: v });*/}
      {/*      }}*/}
      {/*      step={1}*/}
      {/*      style={{ width: 120 }}*/}
      {/*      value={historyCount}*/}
      {/*    />*/}
      {/*  }*/}
      {/*  trigger={'click'}*/}
      {/*>*/}
      {/*  <ActionIcon icon={Timer} title={t('settingChat.historyCount.title')} />*/}
      {/*</Popover>*/}
      <Popconfirm
        cancelText={t('cancel', { ns: 'common' })}
        okButtonProps={{ danger: true }}
        okText={t('ok', { ns: 'common' })}
        onConfirm={() => clearMessage()}
        title={t('confirmClearCurrentMessages', { ns: 'common' })}
      >
        <ActionIcon
          icon={Eraser}
          placement={'bottom'}
          title={t('clearCurrentMessages', { ns: 'common' })}
        />
      </Popconfirm>
    </>
  );
});

export default InputActions;
