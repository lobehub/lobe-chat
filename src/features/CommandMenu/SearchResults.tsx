import { Command } from 'cmdk';
import { FileText, MessageSquare, Sparkles } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { SearchResult } from '@/database/repositories/search';

interface SearchResultsProps {
  isLoading: boolean;
  onClose: () => void;
  results: SearchResult[];
  styles: any;
}

const SearchResults = memo<SearchResultsProps>(({ results, isLoading, onClose, styles }) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const handleNavigate = (result: SearchResult) => {
    switch (result.type) {
      case 'agent': {
        navigate(`/agent/${result.id}?agent=${result.id}`);
        break;
      }
      case 'topic': {
        if (result.agentId) {
          navigate(`/agent/${result.agentId}?topic=${result.id}`);
        } else {
          navigate(`/chat?topic=${result.id}`);
        }
        break;
      }
      case 'file': {
        navigate(`/files?id=${result.id}`);
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

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const getItemValue = (result: SearchResult) => {
    const meta = [result.title, result.description, result.type === 'file' ? result.fileType : null]
      .filter(Boolean)
      .join(' ');
    // Prefix with "search-result" to ensure these items rank after built-in commands
    // Include ID to ensure uniqueness when multiple items have the same title
    return `search-result ${result.type} ${result.id} ${meta}`.trim();
  };

  if (isLoading) {
    return (
      <Command.Group heading={t('cmdk.search.searching')}>
        {[1, 2, 3].map((i) => (
          <div className={styles.skeletonItem} key={i}>
            <div className={styles.skeleton} style={{ height: 20, width: 20 }} />
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 4 }}>
              <div className={styles.skeleton} style={{ width: `${60 + i * 10}%` }} />
              <div className={styles.skeleton} style={{ height: 12, width: `${40 + i * 5}%` }} />
            </div>
          </div>
        ))}
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
              value={getItemValue(result)}
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
              value={getItemValue(result)}
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
              value={getItemValue(result)}
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
