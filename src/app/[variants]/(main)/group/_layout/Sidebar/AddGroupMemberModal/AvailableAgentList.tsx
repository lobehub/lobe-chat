'use client';

import { SearchBar } from '@lobehub/ui';
import { Empty, Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { type ChangeEvent, memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import AgentItem, { type AgentItemData } from './AgentItem';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    user-select: none;

    overflow: hidden;
    display: flex;
    flex: 1;
    flex-direction: column;

    padding-block: ${token.paddingSM}px 0;
    padding-inline: ${token.paddingSM}px;
    border-inline-end: 1px solid ${token.colorBorderSecondary};
  `,
}));

interface AvailableAgentListProps {
  agents: AgentItemData[];
  isLoading: boolean;
}

const AvailableAgentList = memo<AvailableAgentListProps>(({ agents, isLoading }) => {
  const { t } = useTranslation(['chat', 'common']);
  const { styles } = useStyles();
  const [searchTerm, setSearchTerm] = useState('');

  const defaultTitle = useMemo(() => t('defaultSession', { ns: 'common' }), [t]);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Filter agents based on search term (matches title or description)
  const filteredAgents = useMemo(() => {
    if (!searchTerm.trim()) return agents;

    const searchLower = searchTerm.toLowerCase();
    return agents.filter((agent) => {
      const title = agent.title || '';
      const description = agent.description || '';
      return (
        title.toLowerCase().includes(searchLower) || description.toLowerCase().includes(searchLower)
      );
    });
  }, [agents, searchTerm]);

  return (
    <Flexbox className={styles.container} gap={12}>
      <SearchBar
        allowClear
        onChange={handleSearchChange}
        placeholder={t('memberSelection.searchAgents')}
        value={searchTerm}
        variant="filled"
      />

      <Flexbox flex={1} style={{ minHeight: 0 }}>
        {isLoading ? (
          <Flexbox gap={8} padding={8}>
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          </Flexbox>
        ) : filteredAgents.length === 0 ? (
          <Empty
            description={
              searchTerm
                ? t('noMatchingAgents', { ns: 'chat' })
                : t('noAvailableAgents', { ns: 'chat' })
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Virtuoso
            itemContent={(index) => {
              const agent = filteredAgents[index];
              return (
                <AgentItem agent={agent} defaultTitle={defaultTitle} key={agent.id} showCheckbox />
              );
            }}
            style={{ flex: 1 }}
            totalCount={filteredAgents.length}
          />
        )}
      </Flexbox>
    </Flexbox>
  );
});

export default AvailableAgentList;
