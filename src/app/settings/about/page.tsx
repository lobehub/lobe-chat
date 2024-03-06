'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PageTitle from '@/components/PageTitle';
import { useGlobalStore } from '@/store/global';
import { commonSelectors } from '@/store/global/selectors';

import AboutList from './AboutList';
import Analytics from './Analytics';

const useStyles = createStyles(({ css }) => ({
  container: css`
    width: 100%;
    max-width: 1024px;
  `,
}));

export default memo(() => {
  const { t } = useTranslation('setting');

  const { styles } = useStyles();
  const enabledTelemetryChat = useGlobalStore(commonSelectors.enabledTelemetryChat);

  return (
    <>
      <PageTitle title={t('tab.tts')} />
      <Flexbox align={'center'} className={styles.container} gap={12}>
        <AboutList />
        {enabledTelemetryChat && <Analytics />}
      </Flexbox>
    </>
  );
});
