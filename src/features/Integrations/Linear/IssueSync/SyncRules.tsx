'use client';

import type { LinearConnectionView, LinearSyncRuleView } from '@lobechat/types';
import { ActionIcon, Block, Button, confirmModal, Flexbox, Tag, Text, toast } from '@lobehub/ui';
import { RefreshCwIcon, Trash2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { useActiveWorkspaceId } from '@/business/client/hooks/useActiveWorkspaceId';
import { useIsWorkspaceViewer } from '@/business/client/hooks/useIsWorkspaceViewer';
import AsyncError from '@/components/AsyncError';
import { linearService } from '@/services/linear';
import { useCurrentProjectList } from '@/store/project';

import { linearKeys } from '../swrKeys';
import { formatLinearSyncResult, linearSyncErrorMessage } from './utils';

export const useLinearSyncRules = () => {
  const workspaceId = useActiveWorkspaceId();
  return useSWR(linearKeys.syncRules(workspaceId), () => linearService.listSyncRules());
};

interface SyncRulesProps {
  connections: LinearConnectionView[];
}

/** Saved sync rules: re-run one with a click, or remove it. Running never writes to Linear. */
const SyncRules = memo<SyncRulesProps>(({ connections }) => {
  const { t } = useTranslation('integration');
  const { data, error, isValidating, mutate } = useLinearSyncRules();
  const rules = data ?? [];
  const projects = useCurrentProjectList();
  // Viewers can see the rules but not run or remove them.
  const isViewer = useIsWorkspaceViewer();
  const viewerHint = isViewer ? t('linear.sync.viewerDisabled') : undefined;
  const [running, setRunning] = useState<string | null>(null);

  if (error && !data) {
    return (
      <AsyncError
        error={error}
        retrying={isValidating}
        title={t('linear.sync.rules.loadFailed')}
        variant={'block'}
        onRetry={() => void mutate()}
      />
    );
  }
  if (rules.length === 0) return null;

  const organizationOf = (rule: LinearSyncRuleView) =>
    connections.find((connection) => connection.id === rule.connectionId)?.organizationName;
  const projectNameOf = (rule: LinearSyncRuleView) =>
    rule.targetProjectId
      ? (projects.find((project) => project.id === rule.targetProjectId)?.name ??
        t('linear.sync.rules.unknownProject'))
      : t('linear.sync.filter.noProject');

  const runRule = async (rule: LinearSyncRuleView) => {
    setRunning(rule.id);
    try {
      const result = await linearService.runSyncRule(rule.id);
      toast.success(formatLinearSyncResult(result, t));
    } catch (error) {
      toast.error(linearSyncErrorMessage(error, t));
    } finally {
      setRunning(null);
      void mutate();
    }
  };

  const deleteRule = (rule: LinearSyncRuleView) =>
    confirmModal({
      cancelText: t('cancel', { ns: 'common' }),
      content: t('linear.sync.rules.deleteContent'),
      okButtonProps: { danger: true },
      okText: t('linear.sync.rules.delete'),
      onOk: async () => {
        try {
          await linearService.deleteSyncRule(rule.id);
          void mutate();
        } catch {
          toast.error(t('linear.sync.error.generic'));
        }
      },
      title: t('linear.sync.rules.deleteTitle'),
    });

  return (
    <Flexbox gap={10}>
      <Flexbox gap={2}>
        <Text strong style={{ fontSize: 16 }}>
          {t('linear.sync.rules.title')}
        </Text>
        <Text style={{ fontSize: 13 }} type="secondary">
          {t('linear.sync.rules.description')}
        </Text>
      </Flexbox>
      {rules.map((rule) => (
        <Block key={rule.id} padding={12} variant={'filled'}>
          <Flexbox horizontal align={'center'} gap={12}>
            <Flexbox flex={1} gap={6} style={{ minWidth: 0 }}>
              <Text ellipsis strong>
                {[organizationOf(rule), rule.teamName, rule.linearProjectName]
                  .filter(Boolean)
                  .join(' › ')}
              </Text>
              <Flexbox horizontal align={'center'} gap={4} wrap={'wrap'}>
                {(rule.stateTypes ?? []).map((type) => (
                  <Tag key={type}>{t(`linear.sync.state.${type}`)}</Tag>
                ))}
                <Text style={{ fontSize: 13 }} type="secondary">
                  {t('linear.sync.rules.target', { project: projectNameOf(rule) })}
                </Text>
              </Flexbox>
              <Text style={{ fontSize: 12 }} type="secondary">
                {rule.lastRunAt
                  ? t('linear.sync.rules.lastRun', {
                      result: rule.lastResult ? formatLinearSyncResult(rule.lastResult, t) : '',
                      time: new Date(rule.lastRunAt).toLocaleString(),
                    })
                  : t('linear.sync.rules.neverRun')}
              </Text>
            </Flexbox>
            <Button
              disabled={isViewer || (running !== null && running !== rule.id)}
              icon={<RefreshCwIcon size={14} />}
              loading={running === rule.id}
              size={'small'}
              title={viewerHint}
              onClick={() => runRule(rule)}
            >
              {t('linear.sync.rules.run')}
            </Button>
            <ActionIcon
              disabled={isViewer || running === rule.id}
              icon={Trash2Icon}
              size={'small'}
              title={viewerHint ?? t('linear.sync.rules.delete')}
              onClick={() => deleteRule(rule)}
            />
          </Flexbox>
        </Block>
      ))}
    </Flexbox>
  );
});

SyncRules.displayName = 'LinearSyncRules';

export default SyncRules;
