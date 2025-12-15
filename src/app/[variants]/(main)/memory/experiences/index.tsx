import { memo, useCallback, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SCROLL_PARENT_ID } from '@/app/[variants]/(main)/memory/features/TimeLineView/useScrollParent';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';
import { useUserMemoryStore } from '@/store/userMemory';

import FilterBar from '../features/FilterBar';
import Loading from '../features/Loading';
import ViewModeSwitcher, { ViewMode } from '../features/ViewModeSwitcher';
import ExperienceRightPanel from './features/ExperienceRightPanel';
import List from './features/List';

const ExperiencesArea = memo(() => {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState<'createdAt' | 'updatedAt'>('createdAt');

  const refreshExperiences = useUserMemoryStore((s) => s.refreshExperiences);
  const experiencesInit = useUserMemoryStore((s) => s.experiencesInit);
  const experiencesIsLoading = useUserMemoryStore((s) => s.experiencesIsLoading);

  // Initial load
  useEffect(() => {
    refreshExperiences({ q: searchValue, sort: sortValue });
  }, []);

  // Handle search and sort changes
  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      refreshExperiences({ q: value, sort: sortValue });
    },
    [sortValue, refreshExperiences],
  );

  const handleSortChange = useCallback(
    (sort: 'createdAt' | 'updatedAt') => {
      setSortValue(sort);
      refreshExperiences({ q: searchValue, sort });
    },
    [searchValue, refreshExperiences],
  );

  const isLoading = !experiencesInit && experiencesIsLoading;

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
            searchValue={searchValue}
            sortValue={sortValue}
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

const Experiences = memo(() => {
  return (
    <Flexbox height={'100%'} horizontal width={'100%'}>
      <ExperiencesArea />
      <ExperienceRightPanel />
    </Flexbox>
  );
});

export default Experiences;
