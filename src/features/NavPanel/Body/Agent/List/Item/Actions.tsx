import { isDesktop } from '@lobechat/const';
import { ActionIcon, Dropdown, type MenuProps } from '@lobehub/ui';
import { MoreHorizontalIcon } from 'lucide-react';
import { memo, useMemo } from 'react';

import { useSessionItemMenuItems } from '@/features/NavPanel/hooks';
import { useSessionStore } from '@/store/session';
import { sessionHelpers } from '@/store/session/helpers';
import { sessionSelectors } from '@/store/session/selectors';

interface ActionProps {
  group: string | undefined;
  id: string;
  openCreateGroupModal: () => void;
  parentType: 'agent' | 'group';
  toggleEditing: (visible?: boolean) => void;
}

const Actions = memo<ActionProps>(
  ({ group, id, openCreateGroupModal, parentType, toggleEditing }) => {
    const {
      pinMenuItem,
      renameMenuItem,
      duplicateMenuItem,
      openInNewWindowMenuItem,
      moveToGroupMenuItem,
      deleteMenuItem,
    } = useSessionItemMenuItems();

    const [pin, sessionType] = useSessionStore((s) => {
      const session = sessionSelectors.getSessionById(id)(s);
      return [sessionHelpers.getSessionPinned(session), session.type];
    });

    const items = useMemo(
      () =>
        [
          pinMenuItem(id, pin ?? false, parentType),
          renameMenuItem(toggleEditing),
          duplicateMenuItem(id),
          ...(isDesktop ? [openInNewWindowMenuItem(id)] : []),
          { type: 'divider' },
          moveToGroupMenuItem(id, group, openCreateGroupModal),
          { type: 'divider' },
          deleteMenuItem(id, parentType, sessionType),
        ].filter(Boolean) as MenuProps['items'],
      [
        id,
        pin,
        parentType,
        group,
        sessionType,
        pinMenuItem,
        renameMenuItem,
        duplicateMenuItem,
        openInNewWindowMenuItem,
        moveToGroupMenuItem,
        deleteMenuItem,
        openCreateGroupModal,
        toggleEditing,
      ],
    );

    return (
      <Dropdown
        arrow={false}
        menu={{
          items,
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
          },
        }}
        trigger={['click']}
      >
        <ActionIcon icon={MoreHorizontalIcon} size={'small'} />
      </Dropdown>
    );
  },
);

export default Actions;
