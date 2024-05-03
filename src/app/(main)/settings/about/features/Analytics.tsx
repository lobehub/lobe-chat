'use client';

import { Form, type ItemGroup } from '@lobehub/ui';
import { Switch } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';

type SettingItemGroup = ItemGroup;

const Analytics = memo(() => {
  const { t } = useTranslation('setting');
  const checked = useUserStore(preferenceSelectors.userAllowTrace);
  const [updatePreference] = useUserStore((s) => [s.updatePreference]);

  const items: SettingItemGroup = {
    children: [
      {
        children: (
          <Switch
            checked={!!checked}
            onChange={(e) => {
              updatePreference({ telemetry: e });
            }}
          />
        ),
        desc: t('analytics.telemetry.desc'),
        label: t('analytics.telemetry.title'),
        minWidth: undefined,
        valuePropName: 'checked',
      },
    ],
    title: t('analytics.title'),
  };

  return <Form items={[items]} itemsType={'group'} {...FORM_STYLE} />;
});

export default Analytics;
