'use client';

import { Modal } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import useSWR from 'swr';

import { agentService } from '@/services/agent';

import type { AgentItemData } from './AgentItem';
import AvailableAgentList from './AvailableAgentList';
import SelectedAgentList from './SelectedAgentList';
import { useAgentSelectionStore } from './store';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    flex-direction: row;

    height: 500px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
  `,
  rightColumn: css`
    display: flex;
    flex: 1;
    flex-direction: column;
  `,
}));

export interface AddGroupMemberModalProps {
  existingMembers?: string[];
  groupId: string;
  onCancel: () => void;
  onConfirm: (selectedAgents: string[]) => void | Promise<void>;
  open: boolean;
}

const AddGroupMemberModal = memo<AddGroupMemberModalProps>(
  ({ existingMembers = [], onCancel, onConfirm, open }) => {
    const { t } = useTranslation(['chat', 'common']);
    const { styles } = useStyles();

    const selectedAgentIds = useAgentSelectionStore((s) => s.selectedAgentIds);
    const clearSelection = useAgentSelectionStore((s) => s.clearSelection);

    // Fetch agents from the new API (non-virtual agents only)
    const { data: allAgents = [], isLoading: isLoadingAgents } = useSWR(
      open ? 'getAgentsForSelection' : null,
      () => agentService.getAgentsForSelection(),
    );

    // Filter out existing members
    const availableAgents = useMemo<AgentItemData[]>(() => {
      return allAgents.filter((agent) => !existingMembers.includes(agent.id));
    }, [allAgents, existingMembers]);

    // Clear selection when modal closes
    useEffect(() => {
      if (!open) {
        clearSelection();
      }
    }, [open, clearSelection]);

    const [isAdding, setIsAdding] = useState(false);

    const handleConfirm = async () => {
      try {
        setIsAdding(true);
        await onConfirm(selectedAgentIds);
        clearSelection();
      } catch (error) {
        console.error('Failed to add members:', error);
      } finally {
        setIsAdding(false);
      }
    };

    const handleCancel = () => {
      clearSelection();
      onCancel();
    };

    const isConfirmDisabled = selectedAgentIds.length === 0 || isAdding;

    return (
      <Modal
        allowFullscreen
        footer={
          <Flexbox gap={8} horizontal justify="end">
            <Button onClick={handleCancel}>{t('cancel', { ns: 'common' })}</Button>
            <Button
              disabled={isConfirmDisabled}
              loading={isAdding}
              onClick={handleConfirm}
              type="primary"
            >
              {t('memberSelection.addMember')} ({selectedAgentIds.length})
            </Button>
          </Flexbox>
        }
        onCancel={handleCancel}
        open={open}
        title={t('memberSelection.addMember')}
        width={800}
      >
        <Flexbox className={styles.container} horizontal>
          {/* Left Column - Available Agents */}
          <AvailableAgentList agents={availableAgents} isLoading={isLoadingAgents} />

          {/* Right Column - Selected Agents */}
          <SelectedAgentList agents={allAgents} />
        </Flexbox>
      </Modal>
    );
  },
);

export default AddGroupMemberModal;
