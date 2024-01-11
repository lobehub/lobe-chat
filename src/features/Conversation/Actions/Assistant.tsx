import { ActionIconGroup } from '@lobehub/ui';
import { memo } from 'react';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';
import { RenderAction } from '../types';
import { ErrorActionsBar } from './Error';
import { useCustomActions } from './customAction';

export const AssistantActionsBar: RenderAction = memo(({ id, onActionClick, error }) => {
  const { regenerate, edit, delAndRegenerate, copy, divider, del } = useChatListActionsBar();
  const { translate, tts } = useCustomActions();

  if (id === 'default') return;

  if (error) return <ErrorActionsBar onActionClick={onActionClick} />;

  return (
    <ActionIconGroup
      dropdownMenu={[
        edit,
        copy,
        regenerate,
        divider,
        tts,
        translate,
        divider,
        delAndRegenerate,
        del,
      ]}
      items={[regenerate, copy]}
      onActionClick={onActionClick}
      type="ghost"
    />
  );
});
