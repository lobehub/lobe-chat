import { Form, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm, Input, Switch } from 'antd';
import { debounce } from 'lodash-es';
import { SmileIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useEffectAfterGlobalHydrated, useGlobalStore } from '@/store/global';
import { modelProviderSelectors, settingsSelectors } from '@/store/global/selectors';

import Checker from './Checker';

const configKey = 'languageModel';

const LLM = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();

  const [enabledZhipu, setSettings] = useGlobalStore((s) => [
    modelProviderSelectors.enableZhipu(s),
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
            placeholder={t('llm.Zhipu.token.placeholder')}
          />
        ),
        desc: t('llm.Zhipu.token.desc'),
        label: t('llm.Zhipu.token.title'),
        name: [configKey, 'zhipu', 'ZHIPU_API_KEY'],
      },
      {
        children: <Checker />,
        desc: t('llm.OpenAI.check.desc'),
        label: t('llm.OpenAI.check.title'),
        minWidth: undefined,
      },
    ],
    defaultActive: enabledZhipu,
    extra: (
      <Switch
        onChange={(enabled) => {
          setSettings({ languageModel: { zhipu: { enabled } } });
        }}
        value={enabledZhipu}
      />
    ),
    icon: SmileIcon,
    title: t('llm.Zhipu.title'),
  };

  return (
    <Form form={form} items={[model]} onValuesChange={debounce(setSettings, 100)} {...FORM_STYLE} />
  );
});

export default LLM;
