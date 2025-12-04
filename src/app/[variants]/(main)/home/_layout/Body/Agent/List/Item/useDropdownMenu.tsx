import { type MenuProps } from '@lobehub/ui';
import { useMemo } from 'react';

import { useSessionStore } from '@/store/session';
import { sessionHelpers } from '@/store/session/helpers';
import { sessionSelectors } from '@/store/session/selectors';

import { useSessionItemMenuItems } from '../../../../hooks';

interface ActionProps {
  group: string | undefined;
  id: string;
  openCreateGroupModal: () => void;
  parentType: 'agent' | 'group';
  toggleEditing: (visible?: boolean) => void;
}

export const useDropdownMenu = ({
  group,
  id,
  openCreateGroupModal,
  parentType,
  toggleEditing,
}: ActionProps): MenuProps['items'] => {
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

  return useMemo(
    () =>
      [
        pinMenuItem(id, pin ?? false, parentType),
        renameMenuItem(toggleEditing),
        duplicateMenuItem(id),
        openInNewWindowMenuItem(id),
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
};
