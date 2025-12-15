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
import List from './features/List';
import PreferenceRightPanel from './features/PreferenceRightPanel';

const PreferencesArea = memo(() => {
  const { t } = useTranslation('memory');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [searchValueRaw, setSearchValueRaw] = useQueryState('q', { clearOnDefault: true });
  const [sortValueRaw, setSortValueRaw] = useQueryState('sort', { clearOnDefault: true });

  const searchValue = searchValueRaw || '';
  const sortValue = (sortValueRaw as 'scorePriority') || undefined;

  const preferencesPage = useUserMemoryStore((s) => s.preferencesPage);
  const preferencesInit = useUserMemoryStore((s) => s.preferencesInit);
  const preferencesSearchLoading = useUserMemoryStore((s) => s.preferencesSearchLoading);
  const useFetchPreferences = useUserMemoryStore((s) => s.useFetchPreferences);
  const resetPreferencesList = useUserMemoryStore((s) => s.resetPreferencesList);

  const sortOptions = [{ label: t('filter.sort.scorePriority'), value: 'scorePriority' }];

  // 当搜索或排序变化时重置列表
  useEffect(() => {
    const sort = viewMode === 'grid' ? sortValue : undefined;
    resetPreferencesList({ q: searchValue || undefined, sort });
  }, [searchValue, sortValue, viewMode]);

  // 调用 SWR hook 获取数据
  const { isLoading } = useFetchPreferences({
    page: preferencesPage,
    pageSize: 20,
    q: searchValue || undefined,
    sort: viewMode === 'grid' ? sortValue : undefined,
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
  const showLoading = preferencesSearchLoading || !preferencesInit;

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
            onSortChange={viewMode === 'grid' ? handleSortChange : undefined}
            searchValue={searchValue}
            sortOptions={viewMode === 'grid' ? sortOptions : undefined}
            sortValue={sortValue}
          />
          {showLoading ? (
            <Loading viewMode={viewMode} />
          ) : (
            <List isLoading={isLoading} searchValue={searchValue} viewMode={viewMode} />
          )}
        </WideScreenContainer>
      </Flexbox>
    </Flexbox>
  );
});

const Preferences = memo(() => {
  return (
    <Flexbox height={'100%'} horizontal width={'100%'}>
      <PreferencesArea />
      <PreferenceRightPanel />
    </Flexbox>
  );
});

export default Preferences;
