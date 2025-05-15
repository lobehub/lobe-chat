'use client';

import { Form, type FormGroupItemType } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';

import Preview from './Preview';
import { ThemeSwatchesNeutral, ThemeSwatchesPrimary } from './ThemeSwatches';

const Appearance = memo(() => {
  const { t } = useTranslation('setting');
  const [isUserStateInit] = useUserStore((s) => [s.isUserStateInit]);

  if (!isUserStateInit) return <Skeleton active paragraph={{ rows: 5 }} title={false} />;

  const theme: FormGroupItemType = {
    children: [
      {
        children: <Preview />,
        label: t('settingAppearance.preview.title'),
        minWidth: undefined,
      },
      {
        children: <ThemeSwatchesPrimary />,
        desc: t('settingAppearance.primaryColor.desc'),
        label: t('settingAppearance.primaryColor.title'),
        minWidth: undefined,
      },
      {
        children: <ThemeSwatchesNeutral />,
        desc: t('settingAppearance.neutralColor.desc'),
        label: t('settingAppearance.neutralColor.title'),
        minWidth: undefined,
      },
    ],
    title: t('settingAppearance.title'),
  };

  return <Form items={[theme]} itemsType={'group'} variant={'borderless'} {...FORM_STYLE} />;
});

export default Appearance;
