'use client';

import { Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
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
    font-size: 32px;
    font-weight: 600;
    color: ${token.colorText};
    text-align: center;
  `,
  section: css`
    margin-block-end: 48px;
  `,
  sectionTitle: css`
    margin-block-end: 24px;
    font-size: 18px;
    font-weight: 600;
    text-align: center;
  `,
  subText: css`
    margin-block-end: 48px;
    font-size: 16px;
    color: ${token.colorTextSecondary};
    text-align: center;
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

  // Fetch recent files (all categories, sorted by updatedAt)
  const { data: recentFiles, isLoading } = useFetchKnowledgeItems({
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

  // Get top 10 recent files
  const topRecentFiles = useMemo(() => {
    if (!recentFiles) return [];
    return recentFiles.slice(0, 10);
  }, [recentFiles]);

  return (
    <div className={styles.container}>
      <Flexbox className={styles.content}>
        {/* Greeting Section */}
        <Flexbox className={styles.section}>
          <Text className={styles.greeting}>{greeting}</Text>
          <Text className={styles.subText} type="secondary">
            {t('home.subtitle')}
          </Text>
        </Flexbox>

        {/* Recent Files Section */}
        {topRecentFiles.length > 0 && (
          <Flexbox className={styles.section}>
            <Text className={styles.sectionTitle}>{t('home.recentFiles')}</Text>
            <RecentFiles files={topRecentFiles} isLoading={isLoading} onOpenFile={onOpenFile} />
          </Flexbox>
        )}

        {/* Upload Entries Section */}
        <Flexbox className={styles.section}>
          <Text className={styles.sectionTitle}>
            {topRecentFiles.length > 0 ? t('home.quickActions') : t('home.getStarted')}
          </Text>
          <UploadEntries knowledgeBaseId={knowledgeBaseId} />
        </Flexbox>
      </Flexbox>
    </div>
  );
});

export default Home;
