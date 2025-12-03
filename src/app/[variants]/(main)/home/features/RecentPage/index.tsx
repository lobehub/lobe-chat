'use client';

import { ActionIcon, Dropdown, Text } from '@lobehub/ui';
import { FileTextIcon, MoreHorizontal } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useFileCategory } from '@/app/[variants]/(main)/resource/features/hooks/useFileCategory';
import { useInitRecentPage } from '@/hooks/useInitRecentPage';
import { FilesTabs } from '@/types/files';

import RecentPageList from './List';

const RecentPage = memo(() => {
  const { t } = useTranslation('file');

  const navigate = useNavigate();
  const [, setActiveKey] = useFileCategory();
  const [isDocumentsMenuOpen, setIsDocumentsMenuOpen] = useState(false);
  const [isDocumentsSectionHovered, setIsDocumentsSectionHovered] = useState(false);

  const { data: topRecentPageList, isLoading } = useInitRecentPage();

  // Handle document click - navigate to document explorer
  const handleDocumentClick = (documentId: string) => {
    // Navigate to the document in the explorer
    // The KnowledgeHomePage will automatically set category to 'documents' when it detects the id param
    navigate(`/resource/${documentId}`);
  };

  return (
    <Flexbox>
      {(isLoading || (topRecentPageList && topRecentPageList.length > 0)) && (
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
            documents={topRecentPageList || []}
            isLoading={isLoading}
            onOpenDocument={handleDocumentClick}
          />
        </div>
      )}
    </Flexbox>
  );
});

export default RecentPage;
