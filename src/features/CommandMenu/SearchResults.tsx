import { Command } from 'cmdk';
import { Bot, FileText, MessageCircle, MessageSquare, Plug, Puzzle, Sparkles } from 'lucide-react';
import { markdownToTxt } from 'markdown-to-txt';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { SearchResult } from '@/database/repositories/search';

import type { Context } from './types';

interface SearchResultsProps {
  context?: Context;
  isLoading: boolean;
  onClose: () => void;
  results: SearchResult[];
  searchQuery?: string;
  styles: any;
}

const SearchResults = memo<SearchResultsProps>(
  ({ results, isLoading, onClose, styles, context, searchQuery = '' }) => {
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
        case 'message': {
          // Navigate to the topic/agent where the message is
          if (result.topicId && result.agentId) {
            navigate(`/agent/${result.agentId}?topic=${result.topicId}#${result.id}`);
          } else if (result.topicId) {
            navigate(`/chat?topic=${result.topicId}#${result.id}`);
          } else if (result.agentId) {
            navigate(`/agent/${result.agentId}#${result.id}`);
          } else {
            navigate(`/chat#${result.id}`);
          }
          break;
        }
        case 'file': {
          navigate(`/files?id=${result.id}`);
          break;
        }
        case 'mcp': {
          navigate(`/discover/mcp/${result.identifier}`);
          break;
        }
        case 'plugin': {
          navigate(`/discover/plugins/${result.identifier}`);
          break;
        }
        case 'assistant': {
          navigate(`/discover/assistant/${result.identifier}`);
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
        case 'message': {
          return <MessageCircle size={16} />;
        }
        case 'file': {
          return <FileText size={16} />;
        }
        case 'mcp': {
          return <Puzzle size={16} />;
        }
        case 'plugin': {
          return <Plug size={16} />;
        }
        case 'assistant': {
          return <Bot size={16} />;
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
        case 'message': {
          return t('cmdk.search.message');
        }
        case 'file': {
          return t('cmdk.search.file');
        }
        case 'mcp': {
          return t('cmdk.search.mcp');
        }
        case 'plugin': {
          return t('cmdk.search.plugin');
        }
        case 'assistant': {
          return t('cmdk.search.assistant');
        }
      }
    };

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getItemValue = (result: SearchResult) => {
      const meta = [
        result.title,
        result.description,
        result.type === 'file' ? result.fileType : null,
      ]
        .filter(Boolean)
        .join(' ');
      // Prefix with "search-result" to ensure these items rank after built-in commands
      // Include ID to ensure uniqueness when multiple items have the same title
      return `search-result ${result.type} ${result.id} ${meta}`.trim();
    };

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getDescription = (result: SearchResult) => {
      if (!result.description) return null;
      // Sanitize markdown content for message search results
      if (result.type === 'message') {
        return markdownToTxt(result.description);
      }
      return result.description;
    };

    const hasResults = results.length > 0;

    // Group results by type
    const messageResults = results.filter((r) => r.type === 'message');
    const agentResults = results.filter((r) => r.type === 'agent');
    const topicResults = results.filter((r) => r.type === 'topic');
    const fileResults = results.filter((r) => r.type === 'file');
    const mcpResults = results.filter((r) => r.type === 'mcp');
    const pluginResults = results.filter((r) => r.type === 'plugin');
    const assistantResults = results.filter((r) => r.type === 'assistant');

    // In resource context, prioritize file results
    const isResourceContext = context?.type === 'resource';

    // Don't render anything if no results and not loading
    if (!hasResults && !isLoading) {
      return null;
    }

    return (
      <>
        {/* Show files first in resource context */}
        {hasResults && isResourceContext && fileResults.length > 0 && (
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

        {hasResults && messageResults.length > 0 && (
          <Command.Group heading={t('cmdk.search.messages')}>
            {messageResults.map((result) => (
              <Command.Item
                key={`message-${result.id}`}
                onSelect={() => handleNavigate(result)}
                value={getItemValue(result)}
              >
                <div className={styles.itemContent}>
                  <div className={styles.itemIcon}>{getIcon(result.type)}</div>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemTitle}>{result.title}</div>
                    {getDescription(result) && (
                      <div className={styles.itemDescription}>{getDescription(result)}</div>
                    )}
                  </div>
                  <div className={styles.itemType}>{getTypeLabel(result.type)}</div>
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {hasResults && agentResults.length > 0 && (
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
                    {getDescription(result) && (
                      <div className={styles.itemDescription}>{getDescription(result)}</div>
                    )}
                  </div>
                  <div className={styles.itemType}>{getTypeLabel(result.type)}</div>
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {hasResults && topicResults.length > 0 && (
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
                    {getDescription(result) && (
                      <div className={styles.itemDescription}>{getDescription(result)}</div>
                    )}
                  </div>
                  <div className={styles.itemType}>{getTypeLabel(result.type)}</div>
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {/* Show files in original position when NOT in resource context */}
        {hasResults && !isResourceContext && fileResults.length > 0 && (
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

        {hasResults && mcpResults.length > 0 && (
          <Command.Group heading={t('cmdk.search.mcps')}>
            {mcpResults.map((result) => (
              <Command.Item
                key={`mcp-${result.id}`}
                onSelect={() => handleNavigate(result)}
                value={getItemValue(result)}
              >
                <div className={styles.itemContent}>
                  <div className={styles.itemIcon}>{getIcon(result.type)}</div>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemTitle}>{result.title}</div>
                    {getDescription(result) && (
                      <div className={styles.itemDescription}>{getDescription(result)}</div>
                    )}
                  </div>
                  <div className={styles.itemType}>{getTypeLabel(result.type)}</div>
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {hasResults && pluginResults.length > 0 && (
          <Command.Group heading={t('cmdk.search.plugins')}>
            {pluginResults.map((result) => (
              <Command.Item
                key={`plugin-${result.id}`}
                onSelect={() => handleNavigate(result)}
                value={getItemValue(result)}
              >
                <div className={styles.itemContent}>
                  <div className={styles.itemIcon}>{getIcon(result.type)}</div>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemTitle}>{result.title}</div>
                    {getDescription(result) && (
                      <div className={styles.itemDescription}>{getDescription(result)}</div>
                    )}
                  </div>
                  <div className={styles.itemType}>{getTypeLabel(result.type)}</div>
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {hasResults && assistantResults.length > 0 && (
          <Command.Group heading={t('cmdk.search.assistants')}>
            {assistantResults.map((result) => (
              <Command.Item
                key={`assistant-${result.id}`}
                onSelect={() => handleNavigate(result)}
                value={getItemValue(result)}
              >
                <div className={styles.itemContent}>
                  <div className={styles.itemIcon}>{getIcon(result.type)}</div>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemTitle}>{result.title}</div>
                    {getDescription(result) && (
                      <div className={styles.itemDescription}>{getDescription(result)}</div>
                    )}
                  </div>
                  <div className={styles.itemType}>{getTypeLabel(result.type)}</div>
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {/* Show loading skeleton below existing results */}
        {isLoading && (
          <Command.Group>
            {[1, 2, 3].map((i) => (
              <Command.Item
                disabled
                key={`skeleton-${i}`}
                keywords={[searchQuery]}
                value={`${searchQuery}-loading-skeleton-${i}`}
              >
                <div className={styles.skeleton} style={{ height: 20, width: 20 }} />
                <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 4 }}>
                  <div className={styles.skeleton} style={{ width: `${60 + i * 10}%` }} />
                  <div
                    className={styles.skeleton}
                    style={{ height: 12, width: `${40 + i * 5}%` }}
                  />
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </>
    );
  },
);

SearchResults.displayName = 'SearchResults';

export default SearchResults;
