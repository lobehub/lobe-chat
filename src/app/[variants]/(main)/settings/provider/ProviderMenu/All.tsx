import { Icon } from '@lobehub/ui';
import { WalletCards } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { useSearchParams } from 'react-router-dom';

import { useStyles } from './Item';

export const PROVIDER_ALL_PATH = 'all';

const All = memo((props: { onClick: (activeTab: string) => void }) => {
  const { onClick } = props;
  const { t } = useTranslation('modelProvider');
  const { styles, cx } = useStyles();
  const [searchParams] = useSearchParams();
  const activeKey = searchParams.get('provider');

  return (
    <div
      className={cx(styles.container, activeKey === PROVIDER_ALL_PATH && styles.active)}
      onClick={() => {
        onClick(PROVIDER_ALL_PATH);
      }}
    >
      <Flexbox gap={8} horizontal>
        <Center width={24}>
          <Icon icon={WalletCards} size={18} />
        </Center>
        {t('menu.all')}
      </Flexbox>
    </div>
  );
});
export default All;
