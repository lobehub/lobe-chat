'use client';

import { Flexbox, Icon } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { PlusIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncError from '@/components/AsyncError';
import LibraryStatusIcon from '@/components/LibIcon/StatusIcon';
import {
  RESOURCE_HOME_SECTIONS,
  ResourceSectionSkeleton,
} from '@/components/Skeleton/ResourceHome';
import { useCreateNewModal } from '@/features/LibraryModal';
import { useResourceManagerStore } from '@/features/ResourceManager/store';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { usePermission } from '@/hooks/usePermission';
import { knowledgeBaseSelectors, useKnowledgeBaseStore } from '@/store/library';

import { getLibraryListAsyncState } from '../Layout/Body/LibraryList/state';
import SectionTitle from './SectionTitle';

const styles = stylex.create({
  chip: {
    cursor: 'pointer',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    minWidth: '0',
    paddingBlock: '14px',
    paddingInline: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: { 'default': cssVar.colorBorderSecondary, ':hover': cssVar.colorBorder },
    borderRadius: cssVar.borderRadiusLG,
    textAlign: 'start',
    backgroundColor: { 'default': cssVar.colorFillQuaternary, ':hover': cssVar.colorFillTertiary },
    backgroundImage: { 'default': 'none', ':hover': 'none' },
    transition: `all 0.2s ${cssVar.motionEaseInOut}`,
  },
  createChip: {
    cursor: { 'default': 'pointer', ':disabled': 'not-allowed' },
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: '14px',
    paddingInline: '16px',
    borderWidth: '1px',
    borderStyle: 'dashed',
    borderColor: { 'default': cssVar.colorBorder, ':hover': cssVar.colorTextQuaternary },
    borderRadius: cssVar.borderRadiusLG,
    color: { 'default': cssVar.colorTextSecondary, ':hover': cssVar.colorText },
    backgroundColor: 'transparent',
    backgroundImage: 'none',
    transition: `all 0.2s ${cssVar.motionEaseInOut}`,
    opacity: { 'default': null, ':disabled': 0.5 },
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
  },
  name: {
    overflow: 'hidden',
    fontSize: '13px',
    fontWeight: 500,
    color: cssVar.colorText,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

/**
 * How many libraries the quick-access row shows. The list is ordered by last
 * update, so this is "the ones you are working in"; the sidebar stays the full
 * index, which is why the home page must not repeat every library here.
 */
const MAX_LIBRARIES = 9;

/**
 * Quick access to the user's libraries — the everyday entry point of the
 * library home, and the page's only library list.
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
  // A fresh scope has no persisted row yet, so `!isHydrated` keeps the skeleton
  // up until the first local read completes and the network sync lands.
  const { isLoading: showSkeleton } = getLibraryListAsyncState({
    data,
    isLoading: !isHydrated,
    isValidating,
  });

  const setLibraryId = useResourceManagerStore((s) => s.setLibraryId);
  const { open: openCreateLibrary } = useCreateNewModal();

  const handleCreate = () => {
    if (!canCreate) return;
    openCreateLibrary({
      onSuccess: (id) => {
        navigate(`/resource/library/${id}`);
      },
    });
  };

  return (
    <Flexbox gap={12}>
      <SectionTitle title={t('home.libraries')} />
      {error && !data?.length ? (
        <AsyncError error={error} variant={'inline'} onRetry={() => void revalidate()} />
      ) : showSkeleton ? (
        <ResourceSectionSkeleton {...RESOURCE_HOME_SECTIONS.libraries} />
      ) : (
        <div {...stylex.props(styles.grid)}>
          {data?.slice(0, MAX_LIBRARIES).map((item) => (
            <button
              {...stylex.props(styles.chip)}
              key={item.id}
              type={'button'}
              onClick={() => {
                setLibraryId(item.id);
                navigate(`/resource/library/${item.id}`);
              }}
            >
              <LibraryStatusIcon
                memberRestricted={(item as { memberRestricted?: boolean }).memberRestricted}
                size={18}
                visibility={item.visibility}
              />
              <span {...stylex.props(styles.name)}>{item.name}</span>
            </button>
          ))}
          <button
            {...stylex.props(styles.createChip)}
            disabled={!canCreate}
            type={'button'}
            onClick={handleCreate}
          >
            <Icon icon={PlusIcon} size={16} />
            {t('home.uploadEntries.library.title')}
          </button>
        </div>
      )}
    </Flexbox>
  );
});

Libraries.displayName = 'Libraries';

export default Libraries;
