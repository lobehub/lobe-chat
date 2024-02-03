import { Zhipu } from '@lobehub/icons';
import { Form, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm, Input, Switch } from 'antd';
import { useTheme } from 'antd-style';
import { debounce } from 'lodash-es';
import { lighten } from 'polished';
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

const providerKey = 'zhipu';

const ZhipuProvider = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();
  const theme = useTheme();
  const [toggleProviderEnabled, setSettings] = useGlobalStore((s) => [
    s.toggleProviderEnabled,
    s.setSettings,
  ]);
  const enabled = useGlobalStore(modelProviderSelectors.enableZhipu);

  useSyncSettings(form);

  const model: ItemGroup = {
    children: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t('llm.Zhipu.token.placeholder')}
          />
        ),
        desc: t('llm.Zhipu.token.desc'),
        label: t('llm.Zhipu.token.title'),
        name: [LLMProviderConfigKey, providerKey, LLMProviderApiTokenKey],
      },
      {
        children: <Checker model={'glm-3-turbo'} provider={ModelProvider.ZhiPu} />,
        desc: t('llm.checker.desc'),
        label: t('llm.checker.title'),
        minWidth: undefined,
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
        <Zhipu.Combine
          color={theme.isDarkMode ? lighten(0.1, Zhipu.colorPrimary) : Zhipu.colorPrimary}
          size={32}
        />
      </Flexbox>
    ),
  };

  return (
    <Form form={form} items={[model]} onValuesChange={debounce(setSettings, 100)} {...FORM_STYLE} />
  );
});

export default ZhipuProvider;
