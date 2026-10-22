'use client';

import { Flexbox, Icon } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import dayjs from 'dayjs';
import { FileTextIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useActiveWorkspaceId } from '@/business/client/hooks/useActiveWorkspaceId';
import AsyncError from '@/components/AsyncError';
import {
  RESOURCE_HOME_SECTIONS,
  ResourceSectionSkeleton,
} from '@/components/Skeleton/ResourceHome';
import { useResourceManagerStore } from '@/features/ResourceManager/store';
import { getResourceQueryVisibility } from '@/features/ResourceManager/store/selectors';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { useHomeStore } from '@/store/home';
import { homeRecentSelectors } from '@/store/home/selectors';

import SectionTitle from './SectionTitle';

const styles = stylex.create({
  card: {
    cursor: 'pointer',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    paddingBlock: '12px',
    paddingInline: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: { 'default': cssVar.colorBorderSecondary, ':hover': cssVar.colorBorder },
    borderRadius: cssVar.borderRadiusLG,
    textAlign: 'start',
    backgroundColor: cssVar.colorBgContainer,
    backgroundImage: 'none',
    transition: `all 0.2s ${cssVar.motionEaseInOut}`,
    boxShadow: { 'default': null, ':hover': cssVar.boxShadowTertiary },
  },
  emoji: { fontSize: '20px', lineHeight: 1 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '12px',
  },
  meta: { fontSize: '12px', color: cssVar.colorTextQuaternary },
  title: {
    overflow: 'hidden',
    fontSize: '13px',
    fontWeight: 500,
    color: cssVar.colorText,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

const formatTime = (date: Date | string) =>
  dayjs().diff(dayjs(date), 'd') < 7 ? dayjs(date).fromNow() : dayjs(date).format('YYYY-MM-DD');

const RecentPages = memo(() => {
  const { t } = useTranslation('file');
  const navigate = useWorkspaceAwareNavigate();
  const workspaceId = useActiveWorkspaceId();
  const listVisibility = useResourceManagerStore((s) => s.listVisibility);
  const visibility = workspaceId
    ? getResourceQueryVisibility(undefined, listVisibility)
    : undefined;

  // A replica partitioned by user + workspace: a reload paints the last cards
  // from the local copy while the server confirms them.
  const { error, isValidating, revalidate } = useHomeStore((s) => s.useFetchResourceRecentPages)({
    visibility,
  });
  const data = useHomeStore(homeRecentSelectors.resourcePages({ visibility }));
  const isLoading = data === undefined && !error;

  if (!isLoading && !error && !data?.length) return null;

  return (
    <Flexbox gap={12}>
      <SectionTitle
        loading={isValidating && !!data?.length}
        title={t('home.recentPages')}
        viewAllUrl={'/resource/page'}
      />
      {error && !data?.length ? (
        <AsyncError error={error} variant={'inline'} onRetry={() => void revalidate()} />
      ) : isLoading ? (
        <ResourceSectionSkeleton {...RESOURCE_HOME_SECTIONS.pages} />
      ) : (
        <div {...stylex.props(styles.grid)}>
          {data?.map((item) => {
            const { emoji } = item;
            return (
              <button
                {...stylex.props(styles.card)}
                key={item.id}
                type={'button'}
                onClick={() => navigate(`/resource?file=${item.id}`)}
              >
                {emoji ? (
                  <span {...stylex.props(styles.emoji)}>{emoji}</span>
                ) : (
                  <Icon icon={FileTextIcon} size={20} />
                )}
                <Flexbox gap={2} style={{ minWidth: 0 }}>
                  <span {...stylex.props(styles.title)}>{item.name}</span>
                  <span {...stylex.props(styles.meta)}>{formatTime(item.updatedAt)}</span>
                </Flexbox>
              </button>
            );
          })}
        </div>
      )}
    </Flexbox>
  );
});

RecentPages.displayName = 'RecentPages';

export default RecentPages;
