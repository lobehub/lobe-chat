import { Segmented } from 'antd';
import { Calendar, ListIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/Loading/BrandTextLoading';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';
import { useUserMemoryStore } from '@/store/userMemory';

import FilterBar from './features/FilterBar';
import List, { IdentityType, ViewMode } from './features/List';

const Identities = memo(() => {
  const { t } = useTranslation('memory');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState<IdentityType>('all');

  const useFetchIdentities = useUserMemoryStore((s) => s.useFetchIdentities);
  const { data, isLoading } = useFetchIdentities();

  if (isLoading) return <Loading debugId={'Identities'} />;

  return (
    <>
      <NavHeader
        right={
          <>
            <WideScreenButton />
            <Segmented
              onChange={(value) => setViewMode(value as ViewMode)}
              options={[
                {
                  icon: <Calendar size={16} />,
                  label: t('identity.view.timeline'),
                  value: 'timeline',
                },
                { icon: <ListIcon size={16} />, label: t('identity.view.list'), value: 'list' },
              ]}
              value={viewMode}
            />
          </>
        }
      />
      <Flexbox height={'100%'} style={{ overflowY: 'auto', paddingBottom: '16vh' }} width={'100%'}>
        <WideScreenContainer gap={32} paddingBlock={48}>
          <FilterBar
            onSearch={setSearchValue}
            onTypeChange={setTypeFilter}
            searchValue={searchValue}
            typeValue={typeFilter}
          />
          <List
            data={data || []}
            searchValue={searchValue}
            typeFilter={typeFilter}
            viewMode={viewMode}
          />
        </WideScreenContainer>
      </Flexbox>
    </>
  );
});

export default Identities;
