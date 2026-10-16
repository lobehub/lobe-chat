'use client';

import { Flexbox } from '@lobehub/ui';
import { Button, Text, TextArea, toast } from '@lobehub/ui/base-ui';
import { createStaticStyles } from 'antd-style';
import { type KeyboardEvent, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useActiveWorkspaceId } from '@/business/client/hooks/useActiveWorkspaceId';
import { useTaskStore } from '@/store/task';

import AssigneeAvatar from '../features/AssigneeAvatar';
import TaskPriorityTag from '../features/TaskPriorityTag';
import { useAgentDisplayMeta } from '../shared/useAgentDisplayMeta';
import { useAgentVisibility } from '../shared/useAgentVisibility';
import type { KanbanColumnCreateDefaults } from './kanbanBoardModel';

const PRIORITY_LABEL_KEYS = ['none', 'urgent', 'high', 'normal', 'low'] as const;

const styles = createStaticStyles(({ css, cssVar }) => ({
  chip: css`
    display: inline-flex;
    gap: 6px;
    align-items: center;

    height: 24px;
    padding-inline: 8px;
    border-radius: ${cssVar.borderRadius};

    background: ${cssVar.colorFillTertiary};
  `,
  container: css`
    flex: none;

    padding: 8px;
    border: 1px solid ${cssVar.colorPrimaryBorder};
    border-radius: ${cssVar.borderRadiusLG};

    background: ${cssVar.colorBgElevated};
    box-shadow:
      0 1px 2px rgb(0 0 0 / 4%),
      0 2px 6px rgb(0 0 0 / 3%);
  `,
}));

interface KanbanInlineCreateProps {
  /** Board scope agent, used when the column does not pin one. */
  agentId?: string;
  defaults: KanbanColumnCreateDefaults;
  onClose: () => void;
  projectId?: string;
}

/**
 * Quick-create composer rendered inside a Kanban column. The column's pinned
 * fields are shown as read-only chips, so the new task lands in this column.
 */
const KanbanInlineCreate = memo<KanbanInlineCreateProps>(
  ({ agentId, defaults, onClose, projectId }) => {
    const { t } = useTranslation(['chat', 'common']);
    const createTask = useTaskStore((s) => s.createTask);
    const activeWorkspaceId = useActiveWorkspaceId();

    const [title, setTitle] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const assigneeAgentId = defaults.assigneeAgentId ?? agentId;
    const agentMeta = useAgentDisplayMeta(defaults.assigneeAgentId);
    // A private agent can only run private tasks; otherwise workspace tasks
    // default to workspace-visible, same as the create modal.
    const isPrivateAgent = useAgentVisibility(assigneeAgentId) === 'private';

    const handleSubmit = useCallback(async () => {
      const name = title.trim();
      if (!name || submitting) return;

      setSubmitting(true);
      try {
        const result = await createTask({
          assigneeAgentId,
          instruction: name,
          name,
          priority: defaults.priority || undefined,
          projectId,
          visibility: activeWorkspaceId ? (isPrivateAgent ? 'private' : 'public') : undefined,
        });
        if (result) onClose();
      } catch {
        toast.error(t('createTask.createFailed'));
      } finally {
        setSubmitting(false);
      }
    }, [
      activeWorkspaceId,
      assigneeAgentId,
      createTask,
      defaults.priority,
      isPrivateAgent,
      onClose,
      projectId,
      submitting,
      t,
      title,
    ]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          void handleSubmit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      },
      [handleSubmit, onClose],
    );

    return (
      <Flexbox className={styles.container} data-testid={'kanban-inline-create'} gap={8}>
        <TextArea
          autoFocus
          autoSize={{ maxRows: 6, minRows: 1 }}
          disabled={submitting}
          placeholder={t('createTask.titlePlaceholder')}
          value={title}
          variant={'borderless'}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Flexbox horizontal align={'center'} gap={6} justify={'space-between'}>
          <Flexbox horizontal align={'center'} gap={4} style={{ minWidth: 0 }}>
            {defaults.priority !== undefined && (
              <span className={styles.chip}>
                <TaskPriorityTag disableDropdown priority={defaults.priority} size={14} />
                <Text fontSize={12}>
                  {t(`taskDetail.priority.${PRIORITY_LABEL_KEYS[defaults.priority]}` as never)}
                </Text>
              </span>
            )}
            {defaults.assigneeAgentId && (
              <span className={styles.chip}>
                <AssigneeAvatar agentId={defaults.assigneeAgentId} size={16} />
                <Text ellipsis fontSize={12}>
                  {agentMeta?.title}
                </Text>
              </span>
            )}
          </Flexbox>
          <Flexbox horizontal gap={4}>
            <Button size={'small'} type={'text'} onClick={onClose}>
              {t('cancel', { ns: 'common' })}
            </Button>
            <Button
              disabled={!title.trim()}
              loading={submitting}
              size={'small'}
              type={'primary'}
              onClick={() => void handleSubmit()}
            >
              {t('createTask.submit')}
            </Button>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    );
  },
);

export default KanbanInlineCreate;
