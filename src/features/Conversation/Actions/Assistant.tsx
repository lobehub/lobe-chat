import { ActionIconGroup } from '@lobehub/ui';
import { memo } from 'react';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';
import { RenderAction } from '../types';
import { ErrorActionsBar } from './Error';
import { useCustomActions } from './customAction';

export const AssistantActionsBar: RenderAction = memo(({ id, onActionClick, error, tools }) => {
  const { regenerate, edit, delAndRegenerate, copy, divider, del } = useChatListActionsBar();
  const { translate, tts } = useCustomActions();
  const hasTools = !!tools;

  if (id === 'default') return;

  if (error) return <ErrorActionsBar onActionClick={onActionClick} />;

  return (
    <ActionIconGroup
      dropdownMenu={[
        edit,
        copy,
        divider,
        tts,
        translate,
        divider,
        regenerate,
        delAndRegenerate,
        del,
      ]}
      items={[hasTools ? delAndRegenerate : edit, copy]}
      onActionClick={onActionClick}
      type="ghost"
    />
  );
});
