'use client';

import { Flexbox } from '@lobehub/ui';
import * as stylex from '@stylexjs/stylex';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncError from '@/components/AsyncError';
import {
  RESOURCE_HOME_SECTIONS,
  ResourceSectionSkeleton,
} from '@/components/Skeleton/ResourceHome';
import {
  CreateLibraryCard,
  LibraryCard,
  libraryCardStyles,
} from '@/features/LibraryGallery/LibraryCard';
import { useCreateNewModal } from '@/features/LibraryModal';
import { useResourceManagerStore } from '@/features/ResourceManager/store';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { usePermission } from '@/hooks/usePermission';
import { knowledgeBaseSelectors, useKnowledgeBaseStore } from '@/store/library';

import { getLibraryListAsyncState } from '../Layout/Body/LibraryList/state';
import { LIBRARY_INDEX_PATH } from '../paths';
import { pickRecentLibraries, useLibraryVisits } from '../recentLibraries';
import SectionTitle from './SectionTitle';

/** How many libraries the home page shows: the ones opened most recently. */
const MAX_LIBRARIES = 4;

/**
 * Recently opened libraries as cover cards. The full index is the library
 * gallery, reached through "View all".
 */
const Libraries = memo(() => {
  const { t } = useTranslation('file');
  const navigate = useWorkspaceAwareNavigate();
  const { allowed: canCreate } = usePermission('create_content');

  const listVisibility = useResourceManagerStore((s) => s.listVisibility);
  const visibility = listVisibility === 'private' ? ('private' as const) : ('public' as const);

  const useFetchKnowledgeBaseList = useKnowledgeBaseStore((s) => s.useFetchKnowledgeBaseList);
  const { error, isHydrated, isValidating, revalidate } = useFetchKnowledgeBaseList(visibility);
  // The rows are read from the replica view; the hook only orchestrates fetching.
  const data = useKnowledgeBaseStore(knowledgeBaseSelectors.getKnowledgeBaseList(visibility));
  const visits = useLibraryVisits();
  const recent = useMemo(
    () => (data ? pickRecentLibraries(data, visits, MAX_LIBRARIES) : data),
    [data, visits],
  );
  // A fresh scope has no persisted row yet, so `!isHydrated` keeps the skeleton
  // up until the first local read completes and the network sync lands.
  const { isLoading: showSkeleton } = getLibraryListAsyncState({
    data,
    isLoading: !isHydrated,
    isValidating,
  });

  const setLibraryId = useResourceManagerStore((s) => s.setLibraryId);
  const { open: openCreateLibrary } = useCreateNewModal();

  const openLibrary = (id: string) => {
    setLibraryId(id);
    navigate(`/resource/library/${id}`);
  };

  const handleCreate = () => {
    if (!canCreate) return;
    openCreateLibrary({ onSuccess: openLibrary });
  };

  return (
    <Flexbox gap={12}>
      <SectionTitle title={t('docs.home.recentLibraries')} viewAllUrl={LIBRARY_INDEX_PATH} />
      {error && !data?.length ? (
        <AsyncError error={error} variant={'inline'} onRetry={() => void revalidate()} />
      ) : showSkeleton ? (
        <ResourceSectionSkeleton {...RESOURCE_HOME_SECTIONS.libraries} />
      ) : (
        <div {...stylex.props(libraryCardStyles.grid)}>
          {recent?.map((library) => (
            <LibraryCard key={library.id} library={library} onOpen={openLibrary} />
          ))}
          {(recent?.length ?? 0) < MAX_LIBRARIES && (
            <CreateLibraryCard disabled={!canCreate} onCreate={handleCreate} />
          )}
        </div>
      )}
    </Flexbox>
  );
});

Libraries.displayName = 'Libraries';

export default Libraries;
