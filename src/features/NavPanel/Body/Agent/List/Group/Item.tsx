import { AccordionItem, Dropdown, Icon, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { HashIcon, Loader2 } from 'lucide-react';
import React, { memo, useCallback, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SessionList from '@/features/NavPanel/Body/Agent/List/List';
import { useCreateMenuItems, useSessionGroupMenuItems } from '@/features/NavPanel/hooks';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { CustomSessionGroup } from '@/types/session';

import { useAgentModal } from '../../ModalProvider';
import Actions from './Actions';
import Editing from './Editing';
import { useGroupDropdownMenu } from './useDropdownMenu';

const useStyles = createStyles(({ css, token }) => ({
  base: css`
    overflow: hidden;
    transition:
      height,
      opacity,
      margin-block-start 200ms ${token.motionEaseInOut};
  `,
  hide: css`
    pointer-events: none;
    height: 0;
    margin-block-start: -12px;
    opacity: 0;
  `,
  item: css`
    transition: padding-inline-start 200ms ${token.motionEaseInOut};
  `,
  itemExpand: css`
    padding-inline-start: 14px;
  `,
}));

const GroupItem = memo<CustomSessionGroup>(({ children, id, name }) => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const [editing, isUpdating] = useSessionStore((s) => [
    s.sessionGroupRenamingId === id,
    s.sessionGroupUpdatingId === id,
  ]);
  const { cx, styles } = useStyles();

  // Modal management
  const { openMemberSelectionModal, closeMemberSelectionModal, openConfigGroupModal } =
    useAgentModal();

  // Session group menu items
  const { createGroupWithMembers, isCreatingGroup } = useSessionGroupMenuItems();

  // Create menu items
  const { isCreatingAgent } = useCreateMenuItems();

  const toggleEditing = useCallback(
    (visible?: boolean) => {
      useSessionStore.setState(
        { sessionGroupRenamingId: visible ? id : null },
        false,
        'toggleEditing',
      );
    },
    [id],
  );

  // Handler to open member selection modal with callbacks
  const handleOpenMemberSelection = useCallback(() => {
    openMemberSelectionModal({
      onCancel: closeMemberSelectionModal,
      onConfirm: async (selectedAgents, hostConfig, enableSupervisor) => {
        await createGroupWithMembers(
          selectedAgents,
          'New Group Chat',
          hostConfig,
          enableSupervisor,
        );
        closeMemberSelectionModal();
      },
    });
  }, [openMemberSelectionModal, closeMemberSelectionModal, createGroupWithMembers]);

  const handleOpenConfigGroupModal = useCallback(() => {
    openConfigGroupModal();
  }, [openConfigGroupModal]);

  const dropdownMenu = useGroupDropdownMenu({
    handleOpenMemberSelection,
    id,
    isCustomGroup: true,
    openConfigGroupModal: handleOpenConfigGroupModal,
    toggleEditing,
  });

  const isLoading = isCreatingAgent || isCreatingGroup;

  const groupIcon = useMemo(() => {
    if (isUpdating) {
      return <Icon icon={Loader2} spin style={{ opacity: 0.5 }} />;
    }
    return <Icon icon={HashIcon} style={{ opacity: 0.5 }} />;
  }, [isUpdating]);

  return (
    <AccordionItem
      action={<Actions dropdownMenu={dropdownMenu} isLoading={isLoading} />}
      classNames={{
        header: cx(styles.base, !expand && styles.hide),
      }}
      disabled={editing || isUpdating}
      headerWrapper={(header) => (
        <Dropdown
          menu={{
            items: dropdownMenu,
          }}
          trigger={['contextMenu']}
        >
          {header}
        </Dropdown>
      )}
      itemKey={id}
      key={id}
      paddingBlock={4}
      paddingInline={'6px 4px'}
      title={
        <Flexbox align="center" gap={6} horizontal style={{ overflow: 'hidden' }}>
          {groupIcon}
          <Text ellipsis fontSize={12} style={{ flex: 1 }} type={'secondary'} weight={500}>
            {name}
          </Text>
        </Flexbox>
      }
    >
      <Editing id={id} name={name} toggleEditing={toggleEditing} />
      <SessionList
        dataSource={children}
        groupId={id}
        itemClassName={cx(styles.item, expand && styles.itemExpand)}
      />
    </AccordionItem>
  );
});

export default GroupItem;
