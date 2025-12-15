import { memo, useCallback, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';
import { useUserMemoryStore } from '@/store/userMemory';
import { TypesEnum } from '@/types/userMemory';

import Loading from '../features/Loading';
import { SCROLL_PARENT_ID } from '../features/TimeLineView/useScrollParent';
import ViewModeSwitcher, { ViewMode } from '../features/ViewModeSwitcher';
import FilterBar from './features/FilterBar';
import IdentityRightPanel from './features/IdentityRightPanel';
import List, { IdentityType } from './features/List';

const IdentitiesArea = memo(() => {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState<IdentityType>('all');
  const [sortValue, setSortValue] = useState<'createdAt' | 'updatedAt'>('createdAt');

  const refreshIdentities = useUserMemoryStore((s) => s.refreshIdentities);
  const identitiesInit = useUserMemoryStore((s) => s.identitiesInit);
  const identitiesIsLoading = useUserMemoryStore((s) => s.identitiesIsLoading);

  // Initial load
  useEffect(() => {
    refreshIdentities({ q: searchValue, sort: sortValue });
  }, []);

  // Handle search and sort changes
  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      const types = typeFilter === 'all' ? undefined : [typeFilter as TypesEnum];
      refreshIdentities({ q: value, sort: sortValue, types });
    },
    [typeFilter, sortValue, refreshIdentities],
  );

  const handleTypeChange = useCallback(
    (type: IdentityType) => {
      setTypeFilter(type);
      const types = type === 'all' ? undefined : [type as TypesEnum];
      refreshIdentities({ q: searchValue, sort: sortValue, types });
    },
    [searchValue, sortValue, refreshIdentities],
  );

  const handleSortChange = useCallback(
    (sort: 'createdAt' | 'updatedAt') => {
      setSortValue(sort);
      const types = typeFilter === 'all' ? undefined : [typeFilter as TypesEnum];
      refreshIdentities({ q: searchValue, sort, types });
    },
    [searchValue, typeFilter, refreshIdentities],
  );

  const isLoading = !identitiesInit && identitiesIsLoading;

  return (
    <Flexbox flex={1} height={'100%'}>
      <NavHeader
        right={
          <>
            <ViewModeSwitcher onChange={setViewMode} value={viewMode} />
            <WideScreenButton />
          </>
        }
      />
      <Flexbox
        height={'100%'}
        id={SCROLL_PARENT_ID}
        style={{ overflowY: 'auto', paddingBottom: '16vh' }}
        width={'100%'}
      >
        <WideScreenContainer gap={32} paddingBlock={48}>
          <FilterBar
            onSearch={handleSearch}
            onSortChange={handleSortChange}
            onTypeChange={handleTypeChange}
            searchValue={searchValue}
            sortValue={sortValue}
            typeValue={typeFilter}
          />
          {isLoading ? (
            <Loading viewMode={viewMode} />
          ) : (
            <List searchValue={searchValue} viewMode={viewMode} />
          )}
        </WideScreenContainer>
      </Flexbox>
    </Flexbox>
  );
});

const Identities = memo(() => {
  return (
    <Flexbox height={'100%'} horizontal width={'100%'}>
      <IdentitiesArea />
      <IdentityRightPanel />
    </Flexbox>
  );
});

export default Identities;
