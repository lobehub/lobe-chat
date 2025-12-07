import { Empty } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Loading from '@/components/Loading/BrandTextLoading';
import NavHeader from '@/features/NavHeader';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';
import { useUserMemoryStore } from '@/store/userMemory';

import RoleTagCloud from './features/RoleTagCloud';

const Identities = memo(() => {
  const { t } = useTranslation('memory');

  const useFetchIdentities = useUserMemoryStore((s) => s.useFetchIdentities);
  const { data, isLoading } = useFetchIdentities();

  const sortedRoles = useMemo(() => {
    if (!data) return [];
    const allRoles = data.reduce((acc, identity) => {
      if (identity.role) {
        if (!acc.has(identity.role)) {
          acc.set(identity.role, 0);
        }
        acc.set(identity.role, acc.get(identity.role)! + 1);
      }
      return acc;
    }, new Map<string, number>());

    return Array.from(allRoles.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([role]) => role);
  }, [data]);

  if (isLoading) return <Loading debugId={'Home'} />;

  if (!data || data.length === 0) {
    return <Empty description={t('identity.empty')} />;
  }

  return (
    <>
      <NavHeader right={<WideScreenButton />} />
      {<RoleTagCloud roles={sortedRoles} />}
    </>
  );
});

export default Identities;
