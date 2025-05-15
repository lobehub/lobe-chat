'use client';

import { Form, type FormGroupItemType, ImageSelect } from '@lobehub/ui';
import { Select } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { Monitor, Moon, Sun } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { imageUrl } from '@/const/url';
import { localeOptions } from '@/locales/resources';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

const Common = memo(() => {
  const { t } = useTranslation('setting');

  const themeMode = useGlobalStore(systemStatusSelectors.themeMode);
  const language = useGlobalStore(systemStatusSelectors.language);
  const [setThemeMode, switchLocale, isStatusInit] = useGlobalStore((s) => [
    s.switchThemeMode,
    s.switchLocale,
    s.isStatusInit,
  ]);

  if (!isStatusInit) return <Skeleton active paragraph={{ rows: 5 }} title={false} />;

  const theme: FormGroupItemType = {
    children: [
      {
        children: (
          <ImageSelect
            height={60}
            onChange={setThemeMode}
            options={[
              {
                icon: Sun,
                img: imageUrl('theme_light.webp'),
                label: t('settingCommon.themeMode.light'),
                value: 'light',
              },
              {
                icon: Moon,
                img: imageUrl('theme_dark.webp'),
                label: t('settingCommon.themeMode.dark'),
                value: 'dark',
              },
              {
                icon: Monitor,
                img: imageUrl('theme_auto.webp'),
                label: t('settingCommon.themeMode.auto'),
                value: 'auto',
              },
            ]}
            unoptimized={false}
            value={themeMode}
            width={100}
          />
        ),
        label: t('settingCommon.themeMode.title'),
        minWidth: undefined,
      },
      {
        children: (
          <Select
            defaultValue={language}
            onChange={switchLocale}
            options={[{ label: t('settingCommon.lang.autoMode'), value: 'auto' }, ...localeOptions]}
          />
        ),
        label: t('settingCommon.lang.title'),
      },
    ],
    title: t('settingCommon.title'),
  };

  return <Form items={[theme]} itemsType={'group'} variant={'borderless'} {...FORM_STYLE} />;
});

export default Common;
