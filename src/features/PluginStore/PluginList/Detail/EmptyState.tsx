import { Icon, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Puzzle } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding-block: ${token.paddingXL}px;
padding-inline: ${token.paddingLG}px;
  `,
  description: css`
    max-width: 240px;
    line-height: 1.5;
    color: ${token.colorTextSecondary};
    text-align: center;
  `,
  iconWrapper: css`
    display: flex;
    align-items: center;
    justify-content: center;

    width: 64px;
    height: 64px;
    margin-block-end: ${token.marginMD}px;
    border-radius: 50%;

    background-color: ${token.colorPrimaryBg};
  `,
  title: css`
    margin-block-end: ${token.marginSM}px;

    font-size: ${token.fontSizeLG}px;
    font-weight: 500;
    color: ${token.colorText};
    text-align: center;
  `,
}));

const EmptyState = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('plugin');

  return (
    <Center className={styles.container}>
      <Flexbox align="center">
        <div className={styles.iconWrapper}>
          <Icon icon={Puzzle} size={32} />
        </div>
        <Text className={styles.title}>{t('detailModal.emptyState.title')}</Text>
        <Text className={styles.description}>{t('detailModal.emptyState.description')}</Text>
      </Flexbox>
    </Center>
  );
});

export default EmptyState;
