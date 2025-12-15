'use client';

import { Empty, Input } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import AgentItem, { type AgentItemData } from './AgentItem';
import { useAgentSelectionStore } from './store';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow-y: auto;
    flex: 1;
    padding: ${token.paddingSM}px;
  `,
  title: css`
    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
  `,
}));

interface SelectedAgentListProps {
  agents: AgentItemData[];
  groupName: string;
  onGroupNameChange: (name: string) => void;
}

const SelectedAgentList = memo<SelectedAgentListProps>(
  ({ agents, groupName, onGroupNameChange }) => {
    const { t } = useTranslation(['chat', 'common']);
    const { styles } = useStyles();

    const selectedAgentIds = useAgentSelectionStore((s) => s.selectedAgentIds);

    const defaultTitle = useMemo(() => t('defaultSession', { ns: 'common' }), [t]);

    // Get selected agents data
    const selectedAgents = useMemo(() => {
      return selectedAgentIds
        .map((id) => agents.find((a) => a.id === id))
        .filter((a): a is AgentItemData => a !== undefined);
    }, [agents, selectedAgentIds]);

    return (
      <Flexbox className={styles.container} gap={12}>
        <Flexbox gap={4}>
          <div className={styles.title}>{t('sessionGroup.groupName')}</div>
          <Input
            autoFocus
            onChange={(e) => onGroupNameChange(e.target.value)}
            placeholder={t('sessionGroup.inputPlaceholder')}
            value={groupName}
          />
        </Flexbox>

        <Flexbox flex={1} gap={4}>
          <div className={styles.title}>
            {t('sessionGroup.selectedAgents', { count: selectedAgents.length })}
          </div>
          {selectedAgents.length === 0 ? (
            <Flexbox align="center" flex={1} justify="center">
              <Empty description={t('sessionGroup.noSelectedAgents')} />
            </Flexbox>
          ) : (
            <Flexbox>
              {selectedAgents.map((agent) => (
                <AgentItem agent={agent} defaultTitle={defaultTitle} key={agent.id} showRemove />
              ))}
            </Flexbox>
          )}
        </Flexbox>
      </Flexbox>
    );
  },
);

export default SelectedAgentList;
