import { ActionIconGroup, RenderAction, useChatListActionsBar } from '@lobehub/ui';
import { memo } from 'react';

export const SystemActionsBar: RenderAction = memo(({ text, ...props }) => {
  const { del } = useChatListActionsBar(text);
  return <ActionIconGroup dropdownMenu={[del]} items={[]} type="ghost" {...props} />;
});
