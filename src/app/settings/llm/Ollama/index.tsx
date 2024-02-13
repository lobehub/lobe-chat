import { Ollama } from '@lobehub/icons';
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
import { LLMProviderBaseUrlKey, LLMProviderConfigKey } from '../const';
import { useSyncSettings } from '../useSyncSettings';

const providerKey = 'ollama';

const OllamaProvider = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();
  const theme = useTheme();
  const [toggleProviderEnabled, setSettings] = useGlobalStore((s) => [
    s.toggleProviderEnabled,
    s.setSettings,
  ]);
  const enabled = useGlobalStore(modelProviderSelectors.enableOllama);

  useSyncSettings(form);

  const model: ItemGroup = {
    children: [
      {
        children: <Input allowClear placeholder={t('llm.Ollama.endpoint.placeholder')} />,
        desc: t('llm.Ollama.endpoint.desc'),
        label: t('llm.Ollama.endpoint.title'),
        name: [LLMProviderConfigKey, providerKey, LLMProviderBaseUrlKey],
      },
      {
        children: (
          <Input.TextArea
            allowClear
            placeholder={t('llm.Ollama.customModelName.placeholder')}
            style={{ height: 100 }}
          />
        ),
        desc: t('llm.Ollama.customModelName.desc'),
        label: t('llm.Ollama.customModelName.title'),
        name: [LLMProviderConfigKey, providerKey, 'customModelName'],
      },
      {
        children: <Checker model={'llama2'} provider={ModelProvider.Ollama} />,
        desc: t('llm.Ollama.checker.desc'),
        label: t('llm.checker.title'),
        minWidth: undefined,
      },
    ],
    defaultActive: enabled,
    extra: (
      <Switch
        onChange={(enabled: boolean) => {
          toggleProviderEnabled(providerKey, enabled);
        }}
        value={enabled}
      />
    ),
    title: (
      <Flexbox align={'center'} gap={8} horizontal>
        <Ollama.Combine color={theme.isDarkMode ? theme.colorText : theme.colorPrimary} size={24} />
      </Flexbox>
    ),
  };

  return (
    <Form form={form} items={[model]} onValuesChange={debounce(setSettings, 100)} {...FORM_STYLE} />
  );
});

export default OllamaProvider;
