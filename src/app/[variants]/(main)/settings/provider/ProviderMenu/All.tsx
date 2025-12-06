import { Icon } from '@lobehub/ui';
import { WalletCards } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { useLocation } from 'react-router-dom';

import { useStyles } from './Item';

export const PROVIDER_ALL_PATH = 'all';

const All = memo((props: { onClick: (activeTab: string) => void }) => {
  const { onClick } = props;
  const { t } = useTranslation('modelProvider');
  const { styles, cx } = useStyles();
  const location = useLocation();

  // Extract providerId from pathname: /settings/provider/xxx -> xxx
  const activeKey = useMemo(() => {
    const pathParts = location.pathname.split('/');
    // pathname is like /settings/provider/all or /settings/provider/openai
    if (pathParts.length >= 4 && pathParts[2] === 'provider') {
      return pathParts[3];
    }
    return null;
  }, [location.pathname]);

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
