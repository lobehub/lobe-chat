import { Form, Input, type ItemGroup } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { Palette } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { settingsSelectors, useSettings } from '@/store/settings';

const SettingForm = memo(() => {
  const settings = useSettings(settingsSelectors.currentSettings, isEqual);

  const { t } = useTranslation('setting');

  const theme: ItemGroup = useMemo(
    () => ({
      children: [
        {
          children: <Input />,
          desc: t('settingTheme.avatar.desc'),
          label: t('settingTheme.avatar.title'),
          name: 'avatar',
        },
      ],
      icon: Palette,
      title: t('settingTheme.title'),
    }),
    [settings],
  );

  return (
    <Form initialValues={settings} items={[theme]} style={{ maxWidth: 1024, width: '100%' }} />
  );
});

export default SettingForm;
