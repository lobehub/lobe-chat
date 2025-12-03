'use client';

import { ActionIcon, Dropdown } from '@lobehub/ui';
import { FileTextIcon, MoreHorizontal } from 'lucide-react';
import { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFileCategory } from '@/app/[variants]/(main)/resource/features/hooks/useFileCategory';
import { FilesTabs } from '@/types/files';

import GroupBlock from '../components/GroupBlock';
import GroupSkeleton from '../components/GroupSkeleton';
import ScrollShadowWithButton from '../components/ScrollShadowWithButton';
import { RECENT_BLOCK_SIZE } from '../const';
import RecentPageList from './List';

const RecentPage = memo(() => {
  const { t } = useTranslation('file');
  const [, setActiveKey] = useFileCategory();

  return (
    <GroupBlock
      action={
        <Dropdown
          menu={{
            items: [
              {
                key: 'all-documents',
                label: t('menu.allPages'),
                onClick: () => {
                  setActiveKey(FilesTabs.Pages);
                },
              },
            ],
          }}
        >
          <ActionIcon icon={MoreHorizontal} size="small" />
        </Dropdown>
      }
      icon={FileTextIcon}
      title={t('home.recentPages')}
    >
      <ScrollShadowWithButton>
        <Suspense
          fallback={
            <GroupSkeleton
              height={RECENT_BLOCK_SIZE.PAGE.HEIGHT}
              width={RECENT_BLOCK_SIZE.PAGE.WIDTH}
            />
          }
        >
          <RecentPageList />
        </Suspense>
      </ScrollShadowWithButton>
    </GroupBlock>
  );
});

export default RecentPage;
