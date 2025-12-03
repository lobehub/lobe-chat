'use client';

import { ActionIcon, Dropdown, Text } from '@lobehub/ui';
import { Clock, MoreHorizontal } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFileCategory } from '@/app/[variants]/(main)/resource/features/hooks/useFileCategory';
import { useFileStore } from '@/store/file';
import { FilesTabs } from '@/types/files';

import RecentResourceList from './List';

const RecentResource = memo(() => {
  const { t } = useTranslation('file');

  const [, setActiveKey] = useFileCategory();
  const [isFilesMenuOpen, setIsFilesMenuOpen] = useState(false);
  const [isFilesSectionHovered, setIsFilesSectionHovered] = useState(false);
  const useFetchKnowledgeItems = useFileStore((s) => s.useFetchKnowledgeItems);

  // Fetch all items (all categories, sorted by updatedAt)
  const { data: allItems, isLoading } = useFetchKnowledgeItems({
    category: FilesTabs.All,
    sortType: 'desc',
    sorter: 'createdAt',
  });

  // Get top 10 recent files (filter by sourceType === 'file')
  const topRecentResourceList = useMemo(() => {
    if (!allItems) return [];
    const files = allItems.filter((item) => item.sourceType === 'file');
    return files.slice(0, 10);
  }, [allItems]);

  return (
    (isLoading || topRecentResourceList.length > 0) && (
      <div
        onMouseEnter={() => {
          setIsFilesSectionHovered(true);
        }}
        onMouseLeave={() => {
          setIsFilesSectionHovered(false);
        }}
      >
        <div>
          <Text style={{ marginBottom: 0 }}>
            <Clock size={18} />
            {t('home.recentFiles')}
          </Text>
          <div
            style={{
              opacity: isFilesSectionHovered || isFilesMenuOpen ? 1 : 0,
            }}
          >
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'all-files',
                    label: t('menu.allFiles'),
                    onClick: () => {
                      setActiveKey(FilesTabs.All);
                    },
                  },
                ],
              }}
              onOpenChange={setIsFilesMenuOpen}
              open={isFilesMenuOpen}
            >
              <ActionIcon icon={MoreHorizontal} size="small" />
            </Dropdown>
          </div>
        </div>
        <RecentResourceList files={topRecentResourceList} isLoading={isLoading} />
      </div>
    )
  );
});

export default RecentResource;
