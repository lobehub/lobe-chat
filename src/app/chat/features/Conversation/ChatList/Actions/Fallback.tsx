import { ActionIconGroup, RenderAction, useChatListActionsBar } from '@lobehub/ui';
import { memo } from 'react';

export const DefaultActionsBar: RenderAction = memo(({ text, onActionClick }) => {
  const { del } = useChatListActionsBar(text);
  return (
    <ActionIconGroup dropdownMenu={[del]} items={[]} onActionClick={onActionClick} type="ghost" />
  );
});
