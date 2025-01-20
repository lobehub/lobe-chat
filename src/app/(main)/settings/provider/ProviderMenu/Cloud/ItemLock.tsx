import { ActionIcon } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import { ModelProvider } from '@/libs/agent-runtime';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

export const useStyles = createStyles(({ css }) => ({
  loading: css`
    height: 16px;
  `,
}));

const ItemLock = ({ id }: { id: string }) => {
  const { t } = useTranslation('subscription');
  const [isUserStateInit, isFreePlan] = useUserStore((s) => [
    s.isUserStateInit,
    authSelectors.isFreePlan(s),
  ]);
  const { styles } = useStyles();

  if (!isUserStateInit)
    return (
      <Center height={24} width={24}>
        <Skeleton.Button
          active
          rootClassName={styles.loading}
          style={{ height: 16, minHeight: 16, minWidth: 16, width: 16 }}
        />
      </Center>
    );

  return (
    isFreePlan &&
    id !== ModelProvider.LobeHub && (
      <ActionIcon icon={LockIcon} size={'small'} title={t('limitation.providers.lock.menuItem')} />
    )
  );
};

export default ItemLock;
