import { ActionEvent, ActionIconGroup, type ActionIconGroupProps } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useCallback } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

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
  index: number;
  setEditing: (edit: boolean) => void;
}
const Actions = memo<ActionsProps>(({ index, setEditing }) => {
  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);

  const item = useChatStore(
    (s) => chatSelectors.currentChatsWithGuideMessage(meta)(s)[index],
    isEqual,
  );
  const onActionsClick = useActionsClick();

  const handleActionClick = useCallback(
    async (action: ActionEvent) => {
      switch (action.key) {
        case 'edit': {
          setEditing(true);
        }
      }

      onActionsClick(action, item);
    },
    [item],
  );

  const RenderFunction = renderActions[item?.role] ?? ActionsBar;

  return <RenderFunction {...item} onActionClick={handleActionClick} />;
});

export default Actions;
