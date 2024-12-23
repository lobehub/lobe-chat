'use client';

import { Form, type ItemGroup } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';

type SettingItemGroup = ItemGroup;

const Client = memo<{ mobile?: boolean }>(() => {
  const [form] = Form.useForm();
  const { t } = useTranslation('auth');

  const overview: SettingItemGroup = {
    children: [],
    title: t('tab.stats'),
  };

  return (
    <Form form={form} items={[overview]} itemsType={'group'} variant={'pure'} {...FORM_STYLE} />
  );
});

export default Client;
