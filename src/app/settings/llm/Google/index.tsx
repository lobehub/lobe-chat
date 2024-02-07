import { Google } from '@lobehub/icons';
import { Form, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm, Input, Switch } from 'antd';
import { debounce } from 'lodash-es';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { ModelProvider } from '@/libs/agent-runtime';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';
import { GlobalLLMProviderKey } from '@/types/settings';

import Checker from '../Checker';
import { LLMProviderApiTokenKey, LLMProviderConfigKey } from '../const';
import { useSyncSettings } from '../useSyncSettings';

const providerKey: GlobalLLMProviderKey = 'google';

const GoogleProvider = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();
  useSyncSettings(form);

  const [toggleProviderEnabled, setSettings] = useGlobalStore((s) => [
    s.toggleProviderEnabled,
    s.setSettings,
  ]);

  const enabled = useGlobalStore(modelProviderSelectors.enableGoogle);

  const model: ItemGroup = {
    children: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t('llm.Google.token.placeholder')}
          />
        ),
        desc: t('llm.Google.token.desc'),
        label: t('llm.Google.token.title'),
        name: [LLMProviderConfigKey, providerKey, LLMProviderApiTokenKey],
      },
      {
        children: <Checker model={'gemini-pro'} provider={ModelProvider.Google} />,
        desc: t('llm.checker.desc'),
        label: t('llm.checker.title'),
        minWidth: '100%',
      },
    ],
    defaultActive: enabled,
    extra: (
      <Switch
        onChange={(enabled) => {
          toggleProviderEnabled(providerKey, enabled);
        }}
        value={enabled}
      />
    ),
    title: (
      <Flexbox align={'center'} gap={8} horizontal>
        <Google.BrandColor size={28} />
      </Flexbox>
    ),
  };

  return (
    <Form form={form} items={[model]} onValuesChange={debounce(setSettings, 100)} {...FORM_STYLE} />
  );
});

export default GoogleProvider;
