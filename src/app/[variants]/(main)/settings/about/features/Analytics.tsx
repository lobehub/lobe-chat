'use client';

import { Form, type FormGroupItemType } from '@lobehub/ui';
import { Switch } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { BRANDING_NAME } from '@/const/branding';
import { FORM_STYLE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';

const Analytics = memo(() => {
  const { t } = useTranslation('setting');
  const checked = useUserStore(preferenceSelectors.userAllowTrace);
  const [updatePreference] = useUserStore((s) => [s.updatePreference]);

  const items: FormGroupItemType = {
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
        desc: t('analytics.telemetry.desc', { appName: BRANDING_NAME }),
        label: t('analytics.telemetry.title'),
        minWidth: undefined,
        valuePropName: 'checked',
      },
    ],
    title: t('analytics.title'),
  };

  return <Form items={[items]} itemsType={'group'} variant={'borderless'} {...FORM_STYLE} />;
});

export default Analytics;
