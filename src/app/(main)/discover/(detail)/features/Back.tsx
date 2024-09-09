import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => {
  return {
    back: css`
      color: ${token.colorTextDescription};

      &:hover {
        color: ${token.colorText};
      }
    `,
  };
});

const Back = memo<{ href: string }>(({ href }) => {
  const { t } = useTranslation('discover');
  const { styles } = useStyles();
  return (
    <Link className={styles.back} href={href} style={{ marginBottom: 8 }}>
      <Flexbox align={'center'} gap={8} horizontal>
        <Icon icon={ArrowLeft} />
        {t(`back`)}
      </Flexbox>
    </Link>
  );
});

export default Back;
