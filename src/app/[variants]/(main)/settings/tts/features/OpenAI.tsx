'use client';

import { Form, type FormGroupItemType } from '@lobehub/ui';
import { Select } from '@lobehub/ui';
import { Skeleton } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import { opeanaiSTTOptions, opeanaiTTSOptions } from './const';

const OpenAI = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();
  const { tts } = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings, isUserStateInit] = useUserStore((s) => [s.setSettings, s.isUserStateInit]);

  if (!isUserStateInit) return <Skeleton active paragraph={{ rows: 5 }} title={false} />;

  const openai: FormGroupItemType = {
    children: [
      {
        children: <Select options={opeanaiTTSOptions} />,
        label: t('settingTTS.openai.ttsModel'),
        name: ['openAI', 'ttsModel'],
      },
      {
        children: <Select options={opeanaiSTTOptions} />,
        label: t('settingTTS.openai.sttModel'),
        name: ['openAI', 'sttModel'],
      },
    ],
    title: t('settingTTS.openai.title'),
  };

  return (
    <Form
      footer={
        <Form.SubmitFooter
          texts={{
            reset: t('submitFooter.reset'),
            submit: t('submitFooter.submit'),
            unSaved: t('submitFooter.unSaved'),
            unSavedWarning: t('submitFooter.unSavedWarning'),
          }}
        />
      }
      form={form}
      initialValues={tts}
      items={[openai]}
      itemsType={'group'}
      onFinish={(values) => {
        setSettings({
          tts: values,
        });
      }}
      variant={'borderless'}
      {...FORM_STYLE}
    />
  );
});

export default OpenAI;
