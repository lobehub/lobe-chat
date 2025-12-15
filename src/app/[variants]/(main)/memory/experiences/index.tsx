import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { SCROLL_PARENT_ID } from '@/app/[variants]/(main)/memory/features/TimeLineView/useScrollParent';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';
import { useQueryState } from '@/hooks/useQueryParam';
import { useUserMemoryStore } from '@/store/userMemory';

import FilterBar from '../features/FilterBar';
import Loading from '../features/Loading';
import ViewModeSwitcher, { ViewMode } from '../features/ViewModeSwitcher';
import ExperienceRightPanel from './features/ExperienceRightPanel';
import List from './features/List';

const ExperiencesArea = memo(() => {
  const { t } = useTranslation('memory');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [searchValueRaw, setSearchValueRaw] = useQueryState('q', { clearOnDefault: true });
  const [sortValueRaw, setSortValueRaw] = useQueryState('sort', { clearOnDefault: true });

  const searchValue = searchValueRaw || '';
  const sortValue = (sortValueRaw as 'scoreConfidence') || undefined;

  const experiencesPage = useUserMemoryStore((s) => s.experiencesPage);
  const experiencesInit = useUserMemoryStore((s) => s.experiencesInit);
  const experiencesSearchLoading = useUserMemoryStore((s) => s.experiencesSearchLoading);
  const useFetchExperiences = useUserMemoryStore((s) => s.useFetchExperiences);
  const resetExperiencesList = useUserMemoryStore((s) => s.resetExperiencesList);

  const sortOptions = [{ label: t('filter.sort.scoreConfidence'), value: 'scoreConfidence' }];

  // 当搜索或排序变化时重置列表
  useEffect(() => {
    const sort = viewMode === 'masonry' ? sortValue : undefined;
    resetExperiencesList({ q: searchValue || undefined, sort });
  }, [searchValue, sortValue, viewMode]);

  // 调用 SWR hook 获取数据
  useFetchExperiences({
    page: experiencesPage,
    pageSize: 20,
    q: searchValue || undefined,
    sort: viewMode === 'masonry' ? sortValue : undefined,
  });

  // Handle search and sort changes
  const handleSearch = useCallback(
    (value: string) => {
      setSearchValueRaw(value || null);
    },
    [setSearchValueRaw],
  );

  const handleSortChange = useCallback(
    (sort: string) => {
      setSortValueRaw(sort);
    },
    [setSortValueRaw],
  );

  // 显示 loading：搜索/重置中 或 首次加载中
  const showLoading = experiencesSearchLoading || !experiencesInit;

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
            onSortChange={viewMode === 'masonry' ? handleSortChange : undefined}
            searchValue={searchValue}
            sortOptions={viewMode === 'masonry' ? sortOptions : undefined}
            sortValue={sortValue}
          />
          {showLoading ? (
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
