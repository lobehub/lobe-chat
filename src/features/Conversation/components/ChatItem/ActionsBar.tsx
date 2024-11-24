import { ActionEvent, ActionIconGroup, type ActionIconGroupProps } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useCallback } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { MessageRoleType } from '@/types/message';

import { renderActions, useActionsClick } from '../../Actions';
import { useChatListActionsBar } from '../../hooks/useChatListActionsBar';

export type ActionsBarProps = ActionIconGroupProps;

const ActionsBar = memo<ActionsBarProps>((props) => {
  const { regenerate, edit, copy, divider, del } = useChatListActionsBar();
  return (
    <ActionIconGroup
      dropdownMenu={[edit, copy, regenerate, divider, del]}
      items={[regenerate, edit]}
      type="ghost"
      {...props}
    />
  );
});

interface ActionsProps {
  id: string;
}

const Actions = memo<ActionsProps>(({ id }) => {
  const item = useChatStore(chatSelectors.getMessageById(id), isEqual);
  const [toggleMessageEditing] = useChatStore((s) => [s.toggleMessageEditing]);
  const onActionsClick = useActionsClick();

  const handleActionClick = useCallback(
    async (action: ActionEvent) => {
      switch (action.key) {
        case 'edit': {
          toggleMessageEditing(id, true);
        }
      }
      if (!item) return;

      onActionsClick(action, item);
    },
    [item],
  );

  const RenderFunction = renderActions[(item?.role || '') as MessageRoleType] ?? ActionsBar;

  return <RenderFunction {...item!} onActionClick={handleActionClick} />;
});

export default Actions;
