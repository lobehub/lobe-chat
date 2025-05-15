'use client';

import { Form, type FormGroupItemType, Select } from '@lobehub/ui';
import { Skeleton, Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import { sttOptions } from './const';

const STT = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();
  const { tts } = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings, isUserStateInit] = useUserStore((s) => [s.setSettings, s.isUserStateInit]);

  if (!isUserStateInit) return <Skeleton active paragraph={{ rows: 5 }} title={false} />;

  const stt: FormGroupItemType = {
    children: [
      {
        children: <Select options={sttOptions} />,
        desc: t('settingTTS.sttService.desc'),
        label: t('settingTTS.sttService.title'),
        name: 'sttServer',
      },
      {
        children: <Switch />,
        desc: t('settingTTS.sttAutoStop.desc'),
        label: t('settingTTS.sttAutoStop.title'),
        layout: 'horizontal',
        minWidth: undefined,
        name: 'sttAutoStop',
        valuePropName: 'checked',
      },
    ],
    title: t('settingTTS.stt'),
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
      items={[stt]}
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

export default STT;
