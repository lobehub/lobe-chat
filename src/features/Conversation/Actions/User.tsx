import { ActionIconGroup } from '@lobehub/ui';
import { memo } from 'react';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';
import { RenderAction } from '../types';
import { useCustomActions } from './customAction';

export const UserActionsBar: RenderAction = memo(({ onActionClick }) => {
  const { regenerate, edit, copy, divider, del } = useChatListActionsBar();
  const { translate, tts } = useCustomActions();

  return (
    <ActionIconGroup
      dropdownMenu={[edit, copy, regenerate, divider, tts, translate, divider, del]}
      items={[regenerate, edit]}
      onActionClick={onActionClick}
      type="ghost"
    />
  );
});
