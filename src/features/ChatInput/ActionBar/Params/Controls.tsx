import { Form, type FormItemProps, Tag } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { debounce } from 'lodash-es';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import InfoTooltip from '@/components/InfoTooltip';
import {
  FrequencyPenalty,
  PresencePenalty,
  Temperature,
  TopP,
} from '@/features/ModelParamsControl';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useServerConfigStore } from '@/store/serverConfig';

interface ControlsProps {
  setUpdating: (updating: boolean) => void;
  updating: boolean;
}
const Controls = memo<ControlsProps>(({ setUpdating }) => {
  const { t } = useTranslation('setting');
  const mobile = useServerConfigStore((s) => s.isMobile);
  const updateAgentConfig = useAgentStore((s) => s.updateAgentConfig);

  const config = useAgentStore(agentSelectors.currentAgentConfig, isEqual);

  const items: FormItemProps[] = [
    {
      children: <Temperature />,
      label: (
        <Flexbox align={'center'} gap={8} horizontal justify={'space-between'}>
          {t('settingModel.temperature.title')}
          <InfoTooltip title={t('settingModel.temperature.desc')} />
        </Flexbox>
      ),
      name: ['params', 'temperature'],
      tag: 'temperature',
    },
    {
      children: <TopP />,
      label: (
        <Flexbox gap={8} horizontal>
          {t('settingModel.topP.title')}
          <InfoTooltip title={t('settingModel.topP.desc')} />
        </Flexbox>
      ),
      name: ['params', 'top_p'],
      tag: 'top_p',
    },
    {
      children: <PresencePenalty />,
      label: (
        <Flexbox gap={8} horizontal>
          {t('settingModel.presencePenalty.title')}
          <InfoTooltip title={t('settingModel.presencePenalty.desc')} />
        </Flexbox>
      ),
      name: ['params', 'presence_penalty'],
      tag: 'presence_penalty',
    },
    {
      children: <FrequencyPenalty />,
      label: (
        <Flexbox gap={8} horizontal>
          {t('settingModel.frequencyPenalty.title')}
          <InfoTooltip title={t('settingModel.frequencyPenalty.desc')} />
        </Flexbox>
      ),
      name: ['params', 'frequency_penalty'],
      tag: 'frequency_penalty',
    },
  ];

  return (
    <Form
      initialValues={config}
      itemMinWidth={200}
      items={
        mobile
          ? items
          : items.map(({ tag, ...item }) => ({ ...item, desc: <Tag size={'small'}>{tag}</Tag> }))
      }
      itemsType={'flat'}
      onValuesChange={debounce(async (values) => {
        setUpdating(true);
        await updateAgentConfig(values);
        setUpdating(false);
      }, 500)}
      styles={{
        group: {
          background: 'transparent',
          paddingBottom: 12,
        },
      }}
    />
  );
});

export default Controls;
