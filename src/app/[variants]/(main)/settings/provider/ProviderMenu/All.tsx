import { Icon } from '@lobehub/ui';
import { WalletCards } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useStyles } from './Item';

const ALL_PATH = '/settings/provider';

const All = memo(() => {
  const { t } = useTranslation('modelProvider');
  const { styles, cx } = useStyles();
  const pathname = usePathname();

  return (
    <Link className={cx(styles.container, pathname === ALL_PATH && styles.active)} href={ALL_PATH}>
      <Flexbox gap={8} horizontal>
        <Center width={24}>
          <Icon icon={WalletCards} size={{ fontSize: 18 }} />
        </Center>
        {t('menu.all')}
      </Flexbox>
    </Link>
  );
});
export default All;
