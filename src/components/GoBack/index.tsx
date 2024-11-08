import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      width: fit-content;
      height: 24px;
      padding-inline: 8px;

      color: ${token.colorTextTertiary};

      border-radius: 6px;

      &:hover {
        color: ${token.colorTextSecondary};
        background: ${token.colorFillTertiary};
      }
    `,
  };
});

interface GoBackProps {
  href: string;
}

const GoBack = memo<GoBackProps>(({ href }) => {
  const { t } = useTranslation('components');
  const { styles } = useStyles();

  return (
    <Link href={href}>
      <Flexbox align={'center'} className={styles.container} gap={4} horizontal>
        <Icon icon={ArrowLeft} />
        <div>{t('GoBack.back')}</div>
      </Flexbox>
    </Link>
  );
});

export default GoBack;
