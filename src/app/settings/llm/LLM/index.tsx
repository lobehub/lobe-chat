import { Form, type ItemGroup, Markdown } from '@lobehub/ui';
import { Form as AntForm, AutoComplete, Input, Switch } from 'antd';
import { createStyles } from 'antd-style';
import { debounce } from 'lodash-es';
import { Webhook } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { settingsSelectors, useEffectAfterGlobalHydrated, useGlobalStore } from '@/store/global';

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
    const settings = settingsSelectors.currentSettings(store.getState());

    form.setFieldsValue(settings);
  }, []);

  const useAzure = useGlobalStore((s) => s.settings.languageModel.openAI.useAzure);

  const openAI: ItemGroup = {
    children: [
      {
        children: (
          <Input.Password
            placeholder={
              useAzure ? t('llm.AzureOpenAI.token.placeholder') : t('llm.OpenAI.token.placeholder')
            }
          />
        ),
        desc: useAzure ? t('llm.AzureOpenAI.token.desc') : t('llm.OpenAI.token.desc'),
        label: useAzure ? t('llm.AzureOpenAI.token.title') : t('llm.OpenAI.token.title'),
        name: [configKey, 'openAI', 'OPENAI_API_KEY'],
      },
      {
        children: (
          <Input
            allowClear
            placeholder={
              useAzure
                ? t('llm.AzureOpenAI.endpoint.placeholder')
                : t('llm.OpenAI.endpoint.placeholder')
            }
          />
        ),
        desc: useAzure ? t('llm.AzureOpenAI.endpoint.desc') : t('llm.OpenAI.endpoint.desc'),
        label: useAzure ? t('llm.AzureOpenAI.endpoint.title') : t('llm.OpenAI.endpoint.title'),
        name: [configKey, 'openAI', 'endpoint'],
      },
      {
        children: <Input allowClear placeholder={t('llm.OpenAI.customModelName.placeholder')} />,
        desc: t('llm.OpenAI.customModelName.desc'),
        label: t('llm.OpenAI.customModelName.title'),
        name: [configKey, 'openAI', 'customModelName'],
      },
      {
        children: (
          <Switch />
          //   <Flexbox gap={4}>
          //   <div>
          //
          //   </div>
          //   {getClientConfig().USE_AZURE_OPENAI && (
          //     <div className={styles.tip}>{t('llm.OpenAI.useAzure.serverConfig')}</div>
          //   )}
          // </Flexbox>
        ),
        desc: t('llm.OpenAI.useAzure.desc'),
        label: t('llm.OpenAI.useAzure.title'),
        minWidth: undefined,
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
        minWidth: undefined,
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
