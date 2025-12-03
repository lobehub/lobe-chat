'use client';

import { ActionIcon, Dropdown, Text } from '@lobehub/ui';
import { FileTextIcon, MoreHorizontal } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useFileCategory } from '@/app/[variants]/(main)/resource/features/hooks/useFileCategory';
import { useFileStore } from '@/store/file';
import { FilesTabs } from '@/types/files';

import RecentPageList from './List';

const RecentPage = memo(() => {
  const { t } = useTranslation('file');

  const navigate = useNavigate();
  const [, setActiveKey] = useFileCategory();
  const [isDocumentsMenuOpen, setIsDocumentsMenuOpen] = useState(false);
  const [isDocumentsSectionHovered, setIsDocumentsSectionHovered] = useState(false);

  const useFetchKnowledgeItems = useFileStore((s) => s.useFetchKnowledgeItems);

  // Fetch all items (all categories, sorted by updatedAt)
  const { data: allItems, isLoading } = useFetchKnowledgeItems({
    category: FilesTabs.All,
    sortType: 'desc',
    sorter: 'createdAt',
  });

  // Get top 10 recent documents (filter by sourceType === 'document', exclude folders)
  const topRecentPageList = useMemo(() => {
    if (!allItems) return [];
    const documents = allItems.filter(
      (item) => item.sourceType === 'document' && item.fileType !== 'custom/folder',
    );
    return documents.slice(0, 10);
  }, [allItems]);

  // Handle document click - navigate to document explorer
  const handleDocumentClick = (documentId: string) => {
    // Navigate to the document in the explorer
    // The KnowledgeHomePage will automatically set category to 'documents' when it detects the id param
    navigate(`/resource/${documentId}`);
  };

  return (
    <Flexbox>
      {(isLoading || topRecentPageList.length > 0) && (
        <div
          onMouseEnter={() => {
            setIsDocumentsSectionHovered(true);
          }}
          onMouseLeave={() => {
            setIsDocumentsSectionHovered(false);
          }}
        >
          <div>
            <Text style={{ marginBottom: 0 }}>
              <FileTextIcon size={18} />
              {t('home.recentPages')}
            </Text>
            <div
              style={{
                opacity: isDocumentsSectionHovered || isDocumentsMenuOpen ? 1 : 0,
              }}
            >
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
                onOpenChange={setIsDocumentsMenuOpen}
                open={isDocumentsMenuOpen}
              >
                <ActionIcon icon={MoreHorizontal} size="small" />
              </Dropdown>
            </div>
          </div>
          <RecentPageList
            documents={topRecentPageList}
            isLoading={isLoading}
            onOpenDocument={handleDocumentClick}
          />
        </div>
      )}
    </Flexbox>
  );
});

export default RecentPage;
