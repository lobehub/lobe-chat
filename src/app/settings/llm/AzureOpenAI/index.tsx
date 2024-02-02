import { Azure, OpenAI } from '@lobehub/icons';
import { Form, type ItemGroup, Markdown } from '@lobehub/ui';
import { Form as AntForm, AutoComplete, Divider, Input, Switch } from 'antd';
import { createStyles } from 'antd-style';
import { debounce } from 'lodash-es';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { ModelProvider } from '@/libs/agent-runtime';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

import Checker from '../Checker';

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
  const [enabled, setSettings] = useGlobalStore((s) => [
    modelProviderSelectors.enableAzure(s),
    s.setSettings,
  ]);

  useEffect(() => {
    const unsubscribe = useGlobalStore.subscribe(
      (s) => s.settings,
      (settings) => {
        form.setFieldsValue(settings);
      },
    );
    return () => {
      unsubscribe();
    };
  }, []);

  const openAI: ItemGroup = {
    children: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t('llm.AzureOpenAI.token.placeholder')}
          />
        ),
        desc: t('llm.AzureOpenAI.token.desc'),
        label: t('llm.AzureOpenAI.token.title'),
        name: [configKey, 'openAI', 'OPENAI_API_KEY'],
      },
      {
        children: <Input allowClear placeholder={t('llm.AzureOpenAI.endpoint.placeholder')} />,
        desc: t('llm.AzureOpenAI.endpoint.desc'),
        label: t('llm.AzureOpenAI.endpoint.title'),
        name: [configKey, 'openAI', 'endpoint'],
      },
      {
        children: (
          <AutoComplete
            options={[
              '2023-12-01-preview',
              '2023-08-01-preview',
              '2023-07-01-preview',
              '2023-06-01-preview',
            ].map((i) => ({
              label: i,
              value: i,
            }))}
            placeholder={'20XX-XX-XX'}
          />
        ),
        desc: (
          <Markdown className={styles.markdown}>
            {t('llm.AzureOpenAI.azureApiVersion.desc')}
          </Markdown>
        ),
        label: t('llm.AzureOpenAI.azureApiVersion.title'),
        name: [configKey, 'openAI', 'azureApiVersion'],
      },
      {
        children: <Checker model={'gpt-3.5-turbo'} provider={ModelProvider.OpenAI} />,
        desc: t('llm.checker.desc'),
        label: t('llm.checker.title'),
        minWidth: undefined,
      },

      // {
      //   children: useAzure ? <Flexbox>{t('llm.OpenAI.models.notSupport')}</Flexbox> : <ModelList />,
      //   desc: useAzure ? t('llm.OpenAI.models.notSupportTip') : t('llm.OpenAI.models.desc'),
      //   label: t('llm.OpenAI.models.title'),
      //   name: [configKey, 'openAI', 'models'],
      // },
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
        <Azure.Combine size={24} type={'color'}></Azure.Combine>
        <Divider style={{ margin: '0 4px' }} type={'vertical'} />
        <OpenAI.Combine size={24}></OpenAI.Combine>
        {/*{t('llm.Google.title')}*/}
      </Flexbox>
    ),
    // t('llm.OpenAI.title'),
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
