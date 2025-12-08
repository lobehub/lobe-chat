import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SCROLL_PARENT_ID } from '@/app/[variants]/(main)/memory/features/TimeLineView/useScrollParent';
import Loading from '@/components/Loading/BrandTextLoading';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';
import { useUserMemoryStore } from '@/store/userMemory';

import ViewModeSwitcher, { ViewMode } from '../features/ViewModeSwitcher';
import FilterBar from './features/FilterBar';
import IdentityRightPanel from './features/IdentityRightPanel';
import List, { IdentityType } from './features/List';

const IdentitiesArea = memo(() => {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState<IdentityType>('all');

  const useFetchIdentities = useUserMemoryStore((s) => s.useFetchIdentities);
  const identitiesInit = useUserMemoryStore((s) => s.identitiesInit);

  useFetchIdentities();

  if (!identitiesInit) return <Loading debugId={'Identities'} />;

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
            onSearch={setSearchValue}
            onTypeChange={setTypeFilter}
            searchValue={searchValue}
            typeValue={typeFilter}
          />
          <List searchValue={searchValue} typeFilter={typeFilter} viewMode={viewMode} />
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
