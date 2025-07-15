'use client';

import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import CircleLoader from '@/components/CircleLoader';

const useStyles = createStyles(({ css, token }) => ({
  loadingText: css`
    font-size: 14px;
    color: ${token.colorTextSecondary};
  `,
}));

const Loading = () => {
  const { t } = useTranslation('oauth');
  const { styles } = useStyles();

  return (
    <Center gap={16}>
      <CircleLoader />
      <span className={styles.loadingText}>{t('handoff.title.processing')}</span>
    </Center>
  );
};

export default Loading;
