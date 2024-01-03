import { ActionIconGroup, type ActionIconGroupProps } from '@lobehub/ui';
import { memo } from 'react';

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

export default ActionsBar;
