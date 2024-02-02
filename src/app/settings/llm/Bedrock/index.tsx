import { Aws, Bedrock } from '@lobehub/icons';
import { Form, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm, Divider, Input, Switch } from 'antd';
import { debounce } from 'lodash-es';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { ModelProvider } from '@/libs/agent-runtime';
import { useEffectAfterGlobalHydrated, useGlobalStore } from '@/store/global';
import { modelProviderSelectors, settingsSelectors } from '@/store/global/selectors';

import Checker from '../Checker';

const configKey = 'languageModel';
const ProviderKey = 'bedrock';

const LLM = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();

  const [enabled, setSettings] = useGlobalStore((s) => [
    modelProviderSelectors.enableBedrock(s),
    s.setSettings,
  ]);

  useEffectAfterGlobalHydrated((store) => {
    const settings = settingsSelectors.currentSettings(store.getState());

    form.setFieldsValue(settings);
  }, []);

  const model: ItemGroup = {
    children: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t('llm.Bedrock.AWS_ACCESS_KEY_ID.placeholder')}
          />
        ),
        desc: t('llm.Bedrock.AWS_ACCESS_KEY_ID.desc'),
        label: t('llm.Bedrock.AWS_ACCESS_KEY_ID.title'),
        name: [configKey, ProviderKey, 'AWS_ACCESS_KEY_ID'],
      },
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t('llm.Bedrock.AWS_SECRET_ACCESS_KEY.placeholder')}
          />
        ),
        desc: t('llm.Bedrock.AWS_SECRET_ACCESS_KEY.desc'),
        label: t('llm.Bedrock.AWS_SECRET_ACCESS_KEY.title'),
        name: [configKey, ProviderKey, 'AWS_SECRET_ACCESS_KEY'],
      },
      {
        children: (
          <Checker model={'anthropic.claude-instant-v1'} provider={ModelProvider.Bedrock} />
        ),
        desc: t('llm.checker.desc'),
        label: t('llm.checker.title'),
        minWidth: undefined,
      },
    ],
    defaultActive: enabled,
    extra: (
      <Switch
        onChange={(enabled) => {
          setSettings({ languageModel: { bedrock: { enabled } } });
        }}
        value={enabled}
      />
    ),
    title: (
      <Flexbox align={'center'} gap={8} horizontal>
        <Aws.Color size={32} />
        <Divider style={{ margin: '0 4px' }} type={'vertical'} />
        <Bedrock.Combine size={24} type={'color'} />
      </Flexbox>
    ),
  };

  return (
    <Form form={form} items={[model]} onValuesChange={debounce(setSettings, 100)} {...FORM_STYLE} />
  );
});

export default LLM;
