'use client';

import { ActionIcon, Dropdown, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Clock, FileTextIcon, MoreHorizontal } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useFileCategory } from '@/app/[variants]/(main)/knowledge/hooks/useFileCategory';
import { useFileStore } from '@/store/file';
import { FilesTabs } from '@/types/files';

import RecentDocuments from './RecentDocuments';
import RecentFiles from './RecentFiles';
import UploadEntries from './UploadEntries';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding-block: 20px 48px;
padding-inline: 24px;
  `,
  content: css`
    width: 100%;
    max-width: 1200px;
    margin-block: 0;
    margin-inline: auto;
  `,
  greeting: css`
    font-size: 24px;
    font-weight: 600;
    color: ${token.colorText};
    text-align: start;
  `,
  section: css`
    margin-block-end: 36px;
  `,
  sectionActions: css`
    transition: opacity ${token.motionDurationMid} ${token.motionEaseInOut};
  `,
  sectionTitle: css`
    display: flex;
    gap: 8px;
    align-items: center;

    margin-block-end: 24px;

    font-size: 18px;
    font-weight: 600;
    color: ${token.colorTextSecondary};
    text-align: start;
  `,
  sectionTitleWrapper: css`
    display: flex;
    align-items: center;
    justify-content: space-between;

    min-height: 36px;
    margin-block-end: 24px;
  `,
  subText: css`
    margin-block-end: 48px;
    font-size: 16px;
    color: ${token.colorTextSecondary};
    text-align: start;
  `,
}));

interface HomeProps {
  knowledgeBaseId?: string;
  onOpenFile: (id: string) => void;
}

const Home = memo<HomeProps>(({ knowledgeBaseId, onOpenFile }) => {
  const { t } = useTranslation('file');
  const { styles } = useStyles();
  const navigate = useNavigate();
  const [, setActiveKey] = useFileCategory();
  const [isDocumentsMenuOpen, setIsDocumentsMenuOpen] = useState(false);
  const [isDocumentsSectionHovered, setIsDocumentsSectionHovered] = useState(false);

  const useFetchKnowledgeItems = useFileStore((s) => s.useFetchKnowledgeItems);

  // Fetch all items (all categories, sorted by updatedAt)
  const { data: allItems, isLoading } = useFetchKnowledgeItems({
    category: FilesTabs.All,
    knowledgeBaseId,
    sortType: 'desc',
    sorter: 'createdAt',
  });

  // Get top 10 recent files (filter by sourceType === 'file')
  const topRecentFiles = useMemo(() => {
    if (!allItems) return [];
    const files = allItems.filter((item) => item.sourceType === 'file');
    return files.slice(0, 10);
  }, [allItems]);

  // Get top 10 recent documents (filter by sourceType === 'document')
  const topRecentDocuments = useMemo(() => {
    if (!allItems) return [];
    const documents = allItems.filter((item) => item.sourceType === 'document');
    return documents.slice(0, 10);
  }, [allItems]);

  // Handle document click - navigate to document explorer
  const handleDocumentClick = (documentId: string) => {
    // Navigate to the document in the explorer
    // The KnowledgeHomePage will automatically set category to 'documents' when it detects the id param
    navigate(`/${documentId}`);
  };

  return (
    <div className={styles.container}>
      <Flexbox className={styles.content}>
        {/* Greeting Section */}
        <Flexbox className={styles.section}>
          <Text className={styles.greeting}>开始</Text>
        </Flexbox>

        {/* Upload Entries Section */}
        <Flexbox className={styles.section}>
          <UploadEntries knowledgeBaseId={knowledgeBaseId} />
        </Flexbox>

        {/* Recent Files Section */}
        {(isLoading || topRecentFiles.length > 0) && (
          <Flexbox className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Clock size={18} />
              {t('home.recentFiles')}
            </Text>
            <RecentFiles files={topRecentFiles} isLoading={isLoading} onOpenFile={onOpenFile} />
          </Flexbox>
        )}

        {/* Recent Documents Section */}
        {(isLoading || topRecentDocuments.length > 0) && (
          <div
            className={styles.section}
            onMouseEnter={() => {
              console.log('onMouseEnter');
              setIsDocumentsSectionHovered(true);
            }}
            onMouseLeave={() => {
              console.log('onMouseLeave');
              setIsDocumentsSectionHovered(false);
            }}
          >
            <div className={styles.sectionTitleWrapper}>
              <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                <FileTextIcon size={18} />
                {t('home.recentDocuments')}
              </Text>
              <div
                className={styles.sectionActions}
                style={{
                  opacity: isDocumentsSectionHovered || isDocumentsMenuOpen ? 1 : 0,
                }}
              >
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'all-documents',
                        label: t('menu.allDocuments'),
                        onClick: () => {
                          setActiveKey(FilesTabs.Documents);
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
            <RecentDocuments
              documents={topRecentDocuments}
              isLoading={isLoading}
              onOpenDocument={handleDocumentClick}
            />
          </div>
        )}
      </Flexbox>
    </div>
  );
});

export default Home;
