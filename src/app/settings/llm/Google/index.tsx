import { Google } from '@lobehub/icons';
import { Form, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm, Input, Switch } from 'antd';
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

const LLM = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();

  const [enabled, setSettings] = useGlobalStore((s) => [
    modelProviderSelectors.enableGoogle(s),
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
            placeholder={t('llm.Google.token.placeholder')}
          />
        ),
        desc: t('llm.Google.token.desc'),
        label: t('llm.Google.token.title'),
        name: [configKey, 'google', 'GOOGLE_API_KEY'],
      },
      {
        children: <Checker model={'gemini-pro'} provider={ModelProvider.Google} />,
        desc: t('llm.checker.desc'),
        label: t('llm.checker.title'),
        minWidth: undefined,
      },
    ],
    defaultActive: enabled,
    extra: (
      <Switch
        onChange={(enabled) => {
          setSettings({ languageModel: { google: { enabled } } });
        }}
        value={enabled}
      />
    ),
    title: (
      <Flexbox align={'center'} gap={8} horizontal>
        <Google.BrandColor size={32}></Google.BrandColor>
        {/*{t('llm.Google.title')}*/}
      </Flexbox>
    ),
  };

  return (
    <Form form={form} items={[model]} onValuesChange={debounce(setSettings, 100)} {...FORM_STYLE} />
  );
});

export default LLM;
