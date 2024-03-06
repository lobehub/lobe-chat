import { Switch } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useStyles } from '@/app/settings/about/style';
import { useGlobalStore } from '@/store/global';
import { preferenceSelectors } from '@/store/global/selectors';

const Analytics = memo(() => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();
  const checked = useGlobalStore(preferenceSelectors.userAllowTrace);
  const [updatePreference] = useGlobalStore((s) => [s.updatePreference]);

  return (
    <div className={styles.wrapper}>
      <Flexbox className={styles.container} gap={24} padding={16}>
        <Flexbox className={styles.title} gap={8} horizontal>
          {t('analytics.title')}
        </Flexbox>
        <Flexbox gap={24} horizontal>
          <Switch
            checked={!!checked}
            onChange={(e) => {
              updatePreference({ telemetry: e });
            }}
          />
          <Flexbox gap={8}>
            <Flexbox>{t('analytics.telemetry.title')}</Flexbox>
            <Flexbox className={styles.desc}>{t('analytics.telemetry.desc')}</Flexbox>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </div>
  );
});

export default Analytics;
