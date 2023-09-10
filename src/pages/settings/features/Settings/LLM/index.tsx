import { Form, Markdown } from '@lobehub/ui';
import { Form as AntForm, AutoComplete, Checkbox, Input } from 'antd';
import { createStyles } from 'antd-style';
import { debounce } from 'lodash-es';
import { Webhook } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { globalSelectors, useEffectAfterGlobalHydrated, useGlobalStore } from '@/store/global';

import Checker from './Checker';

const useStyles = createStyles(({ css, token }) => ({
  markdown: css`
    a {
      font-size: 12px !important;
    }

    p {
      font-size: 12px !important;
      color: ${token.colorTextDescription} !important;
    }
  `,
  tip: css`
    font-size: 12px;
    color: ${token.colorTextDescription};
  `,
}));

const configKey = 'languageModel';

const LLM = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();
  const { styles } = useStyles();
  const [setSettings] = useGlobalStore((s) => [s.setSettings]);

  useEffectAfterGlobalHydrated((store) => {
    const settings = globalSelectors.currentSettings(store.getState());

    form.setFieldsValue(settings);
  }, []);

  const useAzure = useGlobalStore((s) => s.settings.languageModel.openAI.useAzure);

  const openAI = {
    children: [
      {
        children: <Input.Password placeholder={t('llm.OpenAI.token.placeholder')} />,
        desc: t('llm.OpenAI.token.desc'),
        label: t('llm.OpenAI.token.title'),
        name: [configKey, 'openAI', 'OPENAI_API_KEY'],
      },
      {
        children: <Input placeholder={t('llm.OpenAI.endpoint.placeholder')} />,
        desc: t('llm.OpenAI.endpoint.desc'),

        label: t('llm.OpenAI.endpoint.title'),

        name: [configKey, 'openAI', 'endpoint'],
      },
      {
        children: <Checkbox />,
        desc: t('llm.OpenAI.useAzure.desc'),
        label: t('llm.OpenAI.useAzure.title'),
        name: [configKey, 'openAI', 'useAzure'],
        valuePropName: 'checked',
      },
      {
        children: (
          <AutoComplete
            options={[
              '2023-08-01-preview',
              '2023-07-01-preview',
              '2023-06-01-preview',
              '2023-05-15',
              '2023-03-15-preview',
            ].map((i) => ({
              label: i,
              value: i,
            }))}
            placeholder={'20XX-XX-XX'}
          />
        ),
        desc: (
          <Markdown className={styles.markdown}>{t('llm.OpenAI.azureApiVersion.desc')}</Markdown>
        ),
        hidden: !useAzure,
        label: t('llm.OpenAI.azureApiVersion.title'),
        name: [configKey, 'openAI', 'azureApiVersion'],
      },
      {
        children: <Checker checkModel={!useAzure} />,
        desc: t('llm.OpenAI.check.desc'),
        label: t('llm.OpenAI.check.title'),
      },
      // {
      //   children: useAzure ? <Flexbox>{t('llm.OpenAI.models.notSupport')}</Flexbox> : <ModelList />,
      //   desc: useAzure ? t('llm.OpenAI.models.notSupportTip') : t('llm.OpenAI.models.desc'),
      //   label: t('llm.OpenAI.models.title'),
      //   name: [configKey, 'openAI', 'models'],
      // },
    ],
    icon: Webhook,
    title: t('llm.OpenAI.title'),
  };

  // const azureOpenAI = {
  //   children: [
  //     {
  //       children: <Input.Password placeholder={t('llm.AzureOpenAI.token.placeholder')} />,
  //       desc: t('llm.AzureOpenAI.token.desc'),
  //       label: t('llm.AzureOpenAI.token.title'),
  //       name: [configKey, 'azureOpenAI', 'AZURE_API_KEY'],
  //     },
  //     {
  //       children: <Input placeholder={t('llm.AzureOpenAI.endpoint.placeholder')} />,
  //       desc: t('llm.AzureOpenAI.endpoint.desc'),
  //       label: t('llm.AzureOpenAI.endpoint.title'),
  //       name: [configKey, 'azureOpenAI', 'endpoint'],
  //     },
  //     {
  //       children: <ModelList brand={'azureOpenAI'} />,
  //       desc: t('llm.AzureOpenAI.models.desc'),
  //       label: t('llm.AzureOpenAI.models.title'),
  //       name: [configKey, 'azureOpenAI', 'models'],
  //     },
  //   ],
  //   icon: Webhook,
  //   title: t('llm.AzureOpenAI.title'),
  // };

  return (
    <Form
      form={form}
      items={[openAI]}
      onValuesChange={debounce(setSettings, 100)}
      {...FORM_STYLE}
    />
  );
});

export default LLM;
