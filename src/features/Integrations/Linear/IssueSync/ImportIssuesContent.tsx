'use client';

import type { LinearSyncResult } from '@lobechat/types';
import { Button, Flexbox, Text, toast, useModalContext } from '@lobehub/ui';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { linearService } from '@/services/linear';

import Filters from './Filters';
import IssueList from './IssueList';
import {
  initialImportFilter,
  type LinearImportFilter,
  type LinearIssueImportModalOptions,
} from './types';
import { formatLinearSyncResult, linearSyncErrorMessage } from './utils';

type Pending = 'import' | 'rule' | null;

/**
 * Pick Linear issues and import them as tasks, or save the filter as a sync
 * rule and sync everything it matches. Linear is only read.
 */
const ImportIssuesContent = memo<LinearIssueImportModalOptions>(({ connection, onSynced }) => {
  const { t } = useTranslation('integration');
  const { close } = useModalContext();
  const [filter, setFilter] = useState<LinearImportFilter>(initialImportFilter);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [pending, setPending] = useState<Pending>(null);

  const updateFilter = (patch: Partial<LinearImportFilter>) => {
    setFilter((current) => ({ ...current, ...patch }));
    // The list changes with the filter; a hidden selection would import blind.
    if ('teamId' in patch || 'linearProjectId' in patch || 'stateTypes' in patch) {
      setSelected(new Set());
    }
  };

  const changeSelection = (ids: string[], checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });

  const run = async (kind: Exclude<Pending, null>, action: () => Promise<LinearSyncResult>) => {
    setPending(kind);
    try {
      const result = await action();
      toast.success(formatLinearSyncResult(result, t));
      onSynced?.();
      close();
    } catch (error) {
      toast.error(linearSyncErrorMessage(error, t));
    } finally {
      setPending(null);
    }
  };

  const importSelected = () =>
    run('import', () =>
      linearService.importIssues({
        connectionId: connection.id,
        issueIds: [...selected],
        targetProjectId: filter.targetProjectId,
      }),
    );

  const saveRule = () =>
    run('rule', async () => {
      const rule = await linearService.createSyncRule({
        connectionId: connection.id,
        linearProjectId: filter.linearProjectId,
        linearProjectName: filter.linearProjectName,
        stateTypes: filter.stateTypes,
        targetProjectId: filter.targetProjectId,
        teamId: filter.teamId!,
        teamName: filter.teamName!,
      });
      return linearService.runSyncRule(rule.id);
    });

  const busy = pending !== null;

  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 13 }} type="secondary">
        {t('linear.sync.modal.description')}
      </Text>
      <Filters
        connectionId={connection.id}
        disabled={busy}
        value={filter}
        onChange={updateFilter}
      />
      {filter.teamId ? (
        <IssueList
          disabled={busy}
          selected={selected}
          filter={{
            connectionId: connection.id,
            linearProjectId: filter.linearProjectId,
            stateTypes: filter.stateTypes,
            teamId: filter.teamId,
          }}
          onSelectionChange={changeSelection}
        />
      ) : (
        <Text style={{ fontSize: 13 }} type="secondary">
          {t('linear.sync.list.pickTeam')}
        </Text>
      )}
      <Flexbox horizontal align={'center'} gap={8} justify={'space-between'}>
        <Button
          disabled={!filter.teamId || (busy && pending !== 'rule')}
          loading={pending === 'rule'}
          title={t('linear.sync.modal.saveRuleHint')}
          onClick={saveRule}
        >
          {t('linear.sync.modal.saveRule')}
        </Button>
        <Flexbox horizontal gap={8}>
          <Button disabled={busy} onClick={close}>
            {t('cancel', { ns: 'common' })}
          </Button>
          <Button
            disabled={selected.size === 0 || (busy && pending !== 'import')}
            loading={pending === 'import'}
            type={'primary'}
            onClick={importSelected}
          >
            {t('linear.sync.modal.importSelected', { count: selected.size })}
          </Button>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

ImportIssuesContent.displayName = 'LinearImportIssuesContent';

export default ImportIssuesContent;
