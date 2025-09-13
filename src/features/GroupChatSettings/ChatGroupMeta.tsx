'use client';

import { Form, type FormGroupItemType } from '@lobehub/ui';
import { useUpdateEffect } from 'ahooks';
import { Input } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';

import { selectors, useStore } from './store';

const { TextArea } = Input;

const ChatGroupMeta = memo(() => {
  const { t } = useTranslation(['setting', 'common']);
  const [form] = Form.useForm();

  const updateMeta = useStore((s) => s.updateGroupMeta);
  const meta = useStore(selectors.currentMetaConfig, isEqual) || {};

  useUpdateEffect(() => {
    form.setFieldsValue(meta);
  }, [meta]);

  const groupSettings: FormGroupItemType = {
    children: [
      {
        children: <Input placeholder={t('settingGroup.name.placeholder')} />,
        label: t('settingGroup.name.title'),
        name: 'title',
      },
      {
        children: (
          <TextArea
            autoSize={{ maxRows: 10, minRows: 5 }}
            placeholder={t('settingGroup.description.placeholder')}
            rows={4}
          />
        ),
        label: t('settingGroup.description.title'),
        name: 'description',
      },
    ],
    title: t('settingGroup.title'),
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
      initialValues={meta}
      items={[groupSettings]}
      itemsType={'group'}
      onFinish={updateMeta}
      variant={'borderless'}
      {...FORM_STYLE}
    />
  );
});

export default ChatGroupMeta;
