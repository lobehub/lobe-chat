'use client';

import { ActionIcon, Flexbox, Text } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { Archive, FolderInput, Star, Trash2, X } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { confirmRemoveTopic } from '@/features/DeleteTopicConfirm';
import { openAssociateTopicModal } from '@/features/Projects/WorkingDirectories/AssociateTopicModal';
import { usePermission } from '@/hooks/usePermission';
import { useChatStore } from '@/store/chat';

import MoveToAgentButton from './MoveToAgentButton';
import { useTopicsViewStore } from './store';

const styles = stylex.create({
  bar: {
    pointerEvents: 'auto',
    paddingBlock: '8px',
    paddingInline: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: cssVar.colorBorderSecondary,
    borderRadius: '999px',
    backgroundColor: cssVar.colorBgElevated,
    backgroundImage: 'none',
    boxShadow: cssVar.boxShadowSecondary,
  },
  divider: {
    width: '1px',
    height: '16px',
    marginInline: '2px',
    backgroundColor: cssVar.colorBorderSecondary,
    backgroundImage: 'none',
  },
  overlay: {
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 1000,
    insetBlockEnd: '24px',
    insetInline: '0',
    display: 'flex',
    justifyContent: 'center',
  },
});

const BulkActionBar = memo(() => {
  const { t } = useTranslation('topic');

  const { allowed: canEditTopic } = usePermission('edit_own_content');
  const activeAgentId = useChatStore((s) => s.activeAgentId);
  const selectedIds = useTopicsViewStore((s) => s.selectedIds);
  const exitSelectMode = useTopicsViewStore((s) => s.exitSelectMode);

  const favoriteTopic = useChatStore((s) => s.favoriteTopic);
  const updateTopicStatus = useChatStore((s) => s.updateTopicStatus);
  const removeTopic = useChatStore((s) => s.removeTopic);

  const handleBatchFavorite = useCallback(async () => {
    await Promise.all(selectedIds.map((id) => favoriteTopic(id, true)));
    exitSelectMode();
  }, [selectedIds, favoriteTopic, exitSelectMode]);

  const handleBatchArchive = useCallback(async () => {
    // "Archive" in the UI is a friendlier name for marking topics as
    // completed — the dedicated `archived` status isn't surfaced to users.
    await Promise.all(
      selectedIds.map((id) => updateTopicStatus({ status: 'completed', topicId: id })),
    );
    exitSelectMode();
  }, [selectedIds, updateTopicStatus, exitSelectMode]);

  const handleBatchDelete = useCallback(() => {
    void confirmRemoveTopic({
      content: t('management.bulk.deleteConfirm', { count: selectedIds.length }),
      okText: t('management.bulk.delete'),
      onConfirm: async (removeFiles) => {
        // Serial removal so each call's optimistic update + refetch resolves
        // cleanly; parallel removeTopic causes cascading refetches.
        for (const id of selectedIds) {
          await removeTopic(id, removeFiles);
        }
        exitSelectMode();
      },
      title: t('management.bulk.deleteTitle'),
      topicIds: selectedIds,
    });
  }, [selectedIds, t, removeTopic, exitSelectMode]);

  if (selectedIds.length === 0) return null;

  return (
    <div {...stylex.props(styles.overlay)}>
      <Flexbox horizontal align={'center'} className={stylex.props(styles.bar).className} gap={4}>
        <Text style={{ marginInlineEnd: 8 }} weight={500}>
          {t('management.bulk.selectedCount', { count: selectedIds.length })}
        </Text>
        <ActionIcon
          icon={Star}
          size={'small'}
          title={t('management.bulk.favorite')}
          onClick={handleBatchFavorite}
        />
        <ActionIcon
          icon={Archive}
          size={'small'}
          title={t('management.bulk.archive')}
          onClick={handleBatchArchive}
        />
        <MoveToAgentButton />
        {selectedIds.length === 1 && canEditTopic && (
          <ActionIcon
            aria-label={t('directories.bind', { ns: 'project' })}
            icon={FolderInput}
            size="small"
            title={t('directories.bind', { ns: 'project' })}
            onClick={() => openAssociateTopicModal(selectedIds[0], activeAgentId)}
          />
        )}
        <ActionIcon
          icon={Trash2}
          size={'small'}
          style={{ color: cssVar.colorError }}
          title={t('management.bulk.delete')}
          onClick={handleBatchDelete}
        />
        <span {...stylex.props(styles.divider)} />
        <ActionIcon
          icon={X}
          size={'small'}
          title={t('management.bulk.cancel')}
          onClick={exitSelectMode}
        />
      </Flexbox>
    </div>
  );
});

BulkActionBar.displayName = 'AgentTopicManagerBulkActionBar';

export default BulkActionBar;
