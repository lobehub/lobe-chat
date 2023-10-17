import { ActionIconGroup, RenderAction, useChatListActionsBar } from '@lobehub/ui';
import { memo } from 'react';

import { ErrorActionsBar } from './Error';

export const AssistantActionsBar: RenderAction = memo(({ text, id, onActionClick, error }) => {
  const { regenerate, edit, copy, divider, del } = useChatListActionsBar(text);
  if (id === 'default') return;

  if (error) return <ErrorActionsBar onActionClick={onActionClick} text={text} />;

  return (
    <ActionIconGroup
      dropdownMenu={[edit, copy, regenerate, divider, del]}
      items={[regenerate, copy]}
      onActionClick={onActionClick}
      type="ghost"
    />
  );
});
