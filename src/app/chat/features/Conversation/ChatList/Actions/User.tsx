import { ActionIconGroup, RenderAction, useChatListActionsBar } from '@lobehub/ui';
import { memo } from 'react';

import { useCustomActions } from './customAction';

export const UserActionsBar: RenderAction = memo(({ text, onActionClick }) => {
  const { regenerate, edit, copy, divider, del } = useChatListActionsBar(text);
  const { translate } = useCustomActions();

  return (
    <ActionIconGroup
      dropdownMenu={[edit, copy, regenerate, divider, translate, divider, del]}
      items={[regenerate, edit]}
      onActionClick={onActionClick}
      type="ghost"
    />
  );
});
