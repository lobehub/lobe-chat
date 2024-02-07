import { Moonshot } from '@lobehub/icons';
import { Form, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm, Input, Switch } from 'antd';
import { useTheme } from 'antd-style';
import { debounce } from 'lodash-es';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { ModelProvider } from '@/libs/agent-runtime';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

import Checker from '../Checker';
import { LLMProviderApiTokenKey, LLMProviderConfigKey } from '../const';
import { useSyncSettings } from '../useSyncSettings';

const providerKey = 'moonshot';

const MoonshotProvider = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();
  const theme = useTheme();
  const [toggleProviderEnabled, setSettings] = useGlobalStore((s) => [
    s.toggleProviderEnabled,
    s.setSettings,
  ]);
  const enabled = useGlobalStore(modelProviderSelectors.enableMoonshot);

  useSyncSettings(form);

  const model: ItemGroup = {
    children: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t('llm.Moonshot.token.placeholder')}
          />
        ),
        desc: t('llm.Moonshot.token.desc'),
        label: t('llm.Moonshot.token.title'),
        name: [LLMProviderConfigKey, providerKey, LLMProviderApiTokenKey],
      },
      {
        children: <Checker model={'moonshot-v1-8k'} provider={ModelProvider.Moonshot} />,
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
        <Moonshot.Combine
          color={theme.isDarkMode ? theme.colorText : Moonshot.colorPrimary}
          size={24}
        />
      </Flexbox>
    ),
  };

  return (
    <Form form={form} items={[model]} onValuesChange={debounce(setSettings, 100)} {...FORM_STYLE} />
  );
});

export default MoonshotProvider;
