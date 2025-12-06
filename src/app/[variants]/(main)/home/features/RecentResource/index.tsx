'use client';

import { ActionIcon, Dropdown } from '@lobehub/ui';
import { Clock, MoreHorizontal } from 'lucide-react';
import { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import { useSessionStore } from '@/store/session';
import { recentSelectors } from '@/store/session/selectors';
import { FilesTabs } from '@/types/files';

import GroupBlock from '../components/GroupBlock';
import GroupSkeleton from '../components/GroupSkeleton';
import ScrollShadowWithButton from '../components/ScrollShadowWithButton';
import { RECENT_BLOCK_SIZE } from '../const';
import RecentResourceList from './List';

const RecentResource = memo(() => {
  const { t } = useTranslation('file');
  const navigate = useNavigate();
  const setCategory = useResourceManagerStore((s) => s.setCategory);
  const recentResources = useSessionStore(recentSelectors.recentResources);
  const isInit = useSessionStore(recentSelectors.isRecentResourcesInit);

  // After loaded, if no data, don't render
  if (isInit && (!recentResources || recentResources.length === 0)) {
    return null;
  }

  return (
    <GroupBlock
      action={
        <Dropdown
          menu={{
            items: [
              {
                key: 'all-files',
                label: t('menu.allFiles'),
                onClick: () => {
                  setCategory(FilesTabs.All);
                  navigate('/resource');
                },
              },
            ],
          }}
        >
          <ActionIcon icon={MoreHorizontal} size="small" />
        </Dropdown>
      }
      icon={Clock}
      title={t('home.recentFiles')}
    >
      <ScrollShadowWithButton>
        <Suspense
          fallback={
            <GroupSkeleton
              height={RECENT_BLOCK_SIZE.RESOURCE.HEIGHT}
              width={RECENT_BLOCK_SIZE.RESOURCE.WIDTH}
            />
          }
        >
          <RecentResourceList />
        </Suspense>
      </ScrollShadowWithButton>
    </GroupBlock>
  );
});

export default RecentResource;
