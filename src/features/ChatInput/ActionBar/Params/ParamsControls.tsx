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

interface ParamsControlsProps {
  setUpdating: (updating: boolean) => void;
}
const ParamsControls = memo<ParamsControlsProps>(({ setUpdating }) => {
  const { t } = useTranslation('setting');

  const updateAgentConfig = useAgentStore((s) => s.updateAgentConfig);

  const config = useAgentStore(agentSelectors.currentAgentConfig, isEqual);

  const items: FormItemProps[] = [
    {
      children: <Temperature />,
      desc: <Tag>temperature</Tag>,
      label: (
        <Flexbox align={'center'} gap={8} horizontal justify={'space-between'}>
          {t('settingModel.temperature.title')}
          <InfoTooltip title={t('settingModel.temperature.desc')} />
        </Flexbox>
      ),
      name: ['params', 'temperature'],
    },
    {
      children: <TopP />,
      desc: <Tag>top_p</Tag>,
      label: (
        <Flexbox gap={8} horizontal>
          {t('settingModel.topP.title')}
          <InfoTooltip title={t('settingModel.topP.desc')} />
        </Flexbox>
      ),
      name: ['params', 'top_p'],
    },
    {
      children: <PresencePenalty />,
      desc: <Tag>presence_penalty</Tag>,
      label: (
        <Flexbox gap={8} horizontal>
          {t('settingModel.presencePenalty.title')}
          <InfoTooltip title={t('settingModel.presencePenalty.desc')} />
        </Flexbox>
      ),
      name: ['params', 'presence_penalty'],
    },
    {
      children: <FrequencyPenalty />,
      desc: <Tag>frequency_penalty</Tag>,
      label: (
        <Flexbox gap={8} horizontal>
          {t('settingModel.frequencyPenalty.title')}
          <InfoTooltip title={t('settingModel.frequencyPenalty.desc')} />
        </Flexbox>
      ),
      name: ['params', 'frequency_penalty'],
    },
  ];

  return (
    <Form
      initialValues={config}
      itemMinWidth={200}
      items={items}
      itemsType={'flat'}
      onValuesChange={debounce(async (values) => {
        setUpdating(true);
        await updateAgentConfig(values);
        setUpdating(false);
      }, 500)}
      style={{ fontSize: 12 }}
      variant={'borderless'}
    />
  );
});

export default ParamsControls;
