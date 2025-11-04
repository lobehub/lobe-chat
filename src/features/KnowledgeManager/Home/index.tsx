'use client';

import { Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Clock, FileTextIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/file';
import { FilesTabs } from '@/types/files';

import RecentFiles from './RecentFiles';
import UploadEntries from './UploadEntries';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 48px 24px;
  `,
  content: css`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  `,
  greeting: css`
    margin-block-end: 8px;
    font-size: 24px;
    font-weight: 600;
    color: ${token.colorText};
    text-align: left;
  `,
  section: css`
    margin-block-end: 36px;
  `,
  sectionTitle: css`
    margin-block-end: 24px;
    font-size: 18px;
    font-weight: 600;
    text-align: left;
    color: ${token.colorTextSecondary};
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  subText: css`
    margin-block-end: 48px;
    font-size: 16px;
    color: ${token.colorTextSecondary};
    text-align: left;
  `,
}));

interface HomeProps {
  knowledgeBaseId?: string;
  onOpenFile: (id: string) => void;
}

const Home = memo<HomeProps>(({ knowledgeBaseId, onOpenFile }) => {
  const { t } = useTranslation('file');
  const { styles } = useStyles();

  const useFetchKnowledgeItems = useFileStore((s) => s.useFetchKnowledgeItems);

  // Fetch all items (all categories, sorted by updatedAt)
  const { data: allItems, isLoading } = useFetchKnowledgeItems({
    category: FilesTabs.All,
    knowledgeBaseId,
    sortType: 'desc',
    sorter: 'createdAt',
  });

  // Get greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greeting.morning');
    if (hour < 18) return t('home.greeting.afternoon');
    return t('home.greeting.evening');
  }, [t]);

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

  return (
    <div className={styles.container}>
      <Flexbox className={styles.content}>
        {/* Greeting Section */}
        <Flexbox className={styles.section}>
          <Text className={styles.greeting}>{greeting}</Text>
        </Flexbox>

        {/* Upload Entries Section */}
        <Flexbox className={styles.section}>
          <UploadEntries knowledgeBaseId={knowledgeBaseId} />
        </Flexbox>

        {/* Recent Files Section */}
        {topRecentFiles.length > 0 && (
          <Flexbox className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Clock size={18} />
              {t('home.recentFiles')}
            </Text>
            <RecentFiles files={topRecentFiles} isLoading={isLoading} onOpenFile={onOpenFile} />
          </Flexbox>
        )}

        {/* Recent Documents Section */}
        {topRecentDocuments.length > 0 && (
          <Flexbox className={styles.section}>
            <Text className={styles.sectionTitle}>
              <FileTextIcon size={18} />
              {t('home.recentDocuments')}
            </Text>
            <RecentFiles files={topRecentDocuments} isLoading={isLoading} onOpenFile={onOpenFile} />
          </Flexbox>
        )}
      </Flexbox>
    </div>
  );
});

export default Home;
