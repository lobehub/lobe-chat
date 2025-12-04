import { Command } from 'cmdk';
import { FileText, MessageSquare, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { SearchResult } from '@/database/repositories/search';

interface SearchResultsProps {
  isLoading: boolean;
  onClose: () => void;
  results: SearchResult[];
  styles: any;
}

const SearchResults = memo<SearchResultsProps>(({ results, isLoading, onClose, styles }) => {
  const { t } = useTranslation('common');
  const router = useRouter();

  const handleNavigate = (result: SearchResult) => {
    switch (result.type) {
      case 'agent': {
        router.push(`/chat?agent=${result.id}`);
        break;
      }
      case 'topic': {
        if (result.sessionId) {
          router.push(`/chat?session=${result.sessionId}&topic=${result.id}`);
        } else {
          router.push(`/chat?topic=${result.id}`);
        }
        break;
      }
      case 'file': {
        router.push(`/files?id=${result.id}`);
        break;
      }
    }
    onClose();
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'agent': {
        return <Sparkles size={16} />;
      }
      case 'topic': {
        return <MessageSquare size={16} />;
      }
      case 'file': {
        return <FileText size={16} />;
      }
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'agent': {
        return t('cmdk.search.agent');
      }
      case 'topic': {
        return t('cmdk.search.topic');
      }
      case 'file': {
        return t('cmdk.search.file');
      }
    }
  };

  if (isLoading) {
    return (
      <Command.Group heading={t('cmdk.search.searching')}>
        <Command.Item disabled>{t('cmdk.search.loading')}</Command.Item>
      </Command.Group>
    );
  }

  if (results.length === 0) {
    return null;
  }

  // Group results by type
  const agentResults = results.filter((r) => r.type === 'agent');
  const topicResults = results.filter((r) => r.type === 'topic');
  const fileResults = results.filter((r) => r.type === 'file');

  return (
    <>
      {agentResults.length > 0 && (
        <Command.Group heading={t('cmdk.search.agents')}>
          {agentResults.map((result) => (
            <Command.Item
              key={`agent-${result.id}`}
              onSelect={() => handleNavigate(result)}
              value={result.id}
            >
              <div className={styles.itemContent}>
                <div className={styles.itemIcon}>{getIcon(result.type)}</div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemTitle}>{result.title}</div>
                  {result.description && (
                    <div className={styles.itemDescription}>{result.description}</div>
                  )}
                </div>
                <div className={styles.itemType}>{getTypeLabel(result.type)}</div>
              </div>
            </Command.Item>
          ))}
        </Command.Group>
      )}

      {topicResults.length > 0 && (
        <Command.Group heading={t('cmdk.search.topics')}>
          {topicResults.map((result) => (
            <Command.Item
              key={`topic-${result.id}`}
              onSelect={() => handleNavigate(result)}
              value={result.id}
            >
              <div className={styles.itemContent}>
                <div className={styles.itemIcon}>{getIcon(result.type)}</div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemTitle}>{result.title}</div>
                  {result.description && (
                    <div className={styles.itemDescription}>{result.description}</div>
                  )}
                </div>
                <div className={styles.itemType}>{getTypeLabel(result.type)}</div>
              </div>
            </Command.Item>
          ))}
        </Command.Group>
      )}

      {fileResults.length > 0 && (
        <Command.Group heading={t('cmdk.search.files')}>
          {fileResults.map((result) => (
            <Command.Item
              key={`file-${result.id}`}
              onSelect={() => handleNavigate(result)}
              value={result.id}
            >
              <div className={styles.itemContent}>
                <div className={styles.itemIcon}>{getIcon(result.type)}</div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemTitle}>{result.title}</div>
                  {result.type === 'file' && (
                    <div className={styles.itemDescription}>{result.fileType}</div>
                  )}
                </div>
                <div className={styles.itemType}>{getTypeLabel(result.type)}</div>
              </div>
            </Command.Item>
          ))}
        </Command.Group>
      )}
    </>
  );
});

SearchResults.displayName = 'SearchResults';

export default SearchResults;
