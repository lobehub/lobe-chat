// components/Common/CommonSettingsForm.tsx

'use client';

import { Form, type FormGroupItemType, Icon, ImageSelect, InputPassword } from '@lobehub/ui';
import { Select } from '@lobehub/ui';
import { Segmented } from 'antd';
import { Ban, Gauge, Loader2Icon, Monitor, Moon, Sun, Waves } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { imageUrl } from '@/const/url';
import { localeOptions } from '@/locales/resources';
import { UserSettingsState } from '@/store/user/slices/settings/initialState';

interface CommonSettingsFormProps {
  initialValues: UserSettingsState;
  language: string;
  onLocaleChange: (locale: string) => void;
  onThemeModeChange: (themeMode: 'light' | 'dark' | 'auto') => void;
  onValuesChange: (values: Partial<UserSettingsState>) => Promise<void>;
  showAccessCodeConfig: boolean;
  themeMode: 'light' | 'dark' | 'auto';
}

const CommonSettingsForm = memo<CommonSettingsFormProps>(
  ({
    initialValues,
    showAccessCodeConfig,
    themeMode,
    language,
    onValuesChange,
    onThemeModeChange,
    onLocaleChange,
  }) => {
    const { t } = useTranslation('setting');
    const [loading, setLoading] = useState(false);

    const themeGroup: FormGroupItemType = {
      children: [
        {
          children: (
            <ImageSelect
              height={60}
              onChange={onThemeModeChange} // 使用 props 传入的回调
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
              value={themeMode} // 使用 props 传入的值
              width={100}
            />
          ),
          label: t('settingCommon.themeMode.title'),
          minWidth: undefined,
        },
        {
          children: (
            <Select
              defaultValue={language} // 使用 props 传入的值
              onChange={onLocaleChange} // 使用 props 传入的回调
              options={[{ label: t('settingCommon.lang.autoMode'), value: 'auto' }, ...localeOptions]}
            />
          ),
          label: t('settingCommon.lang.title'),
        },
        {
          children: (
            <Segmented
              options={[
                {
                  icon: <Icon icon={Ban} size={16} />,
                  label: t('settingAppearance.animationMode.disabled'),
                  value: 'disabled',
                },
                {
                  icon: <Icon icon={Gauge} size={16} />,
                  label: t('settingAppearance.animationMode.agile'),
                  value: 'agile',
                },
                {
                  icon: <Icon icon={Waves} size={16} />,
                  label: t('settingAppearance.animationMode.elegant'),
                  value: 'elegant',
                },
              ]}
            />
          ),
          desc: t('settingAppearance.animationMode.desc'),
          label: t('settingAppearance.animationMode.title'),
          minWidth: undefined,
          name: 'animationMode',
        },
        {
          children: (
            <InputPassword
              autoComplete={'new-password'}
              placeholder={t('settingSystem.accessCode.placeholder')}
            />
          ),
          desc: t('settingSystem.accessCode.desc'),
          hidden: !showAccessCodeConfig, // 使用 props 传入的值
          label: t('settingSystem.accessCode.title'),
          name: 'password',
        },
      ],
      // loading 状态是纯 UI 状态，保留在展示组件内部是合理的
      extra: loading && <Icon icon={Loader2Icon} spin style={{ opacity: 0.5 }} />,
      title: t('settingCommon.title'),
    };

    return (
      <Form
        initialValues={initialValues} // 使用 props 传入的初始值
        items={[themeGroup]}
        itemsType={'group'}
        onValuesChange={async (changedValues) => {
          // 优化：只在 onValuesChange 中处理 general settings 的变更
          setLoading(true);
          await onValuesChange(changedValues);
          setLoading(false);
        }}
        variant={'borderless'}
        {...FORM_STYLE}
      />
    );
  },
);

export default CommonSettingsForm;