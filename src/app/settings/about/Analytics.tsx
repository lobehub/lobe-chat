import { Switch } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { preferenceSelectors } from '@/store/global/selectors';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    width: 100%;
    max-width: 1024px;
    border: 1px solid ${token.colorBorder};
    border-radius: 8px;
  `,
  desc: css`
    color: ${token.colorTextTertiary};
  `,
  title: css`
    font-size: 16px;
    font-weight: 600;
  `,
}));

const Analytics = memo(() => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();
  const checked = useGlobalStore(preferenceSelectors.userAllowTrace);
  const [updatePreference] = useGlobalStore((s) => [s.updatePreference]);

  return (
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
  );
});

export default Analytics;
