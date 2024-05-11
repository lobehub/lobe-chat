import { memo } from 'react';

import { RenderAction } from '../types';

export const ToolActionsBar: RenderAction = memo(() => {
  return undefined;
  // const { regenerate } = useChatListActionsBar();
  // return (
  //   <ActionIconGroup
  //     dropdownMenu={[regenerate]}
  //     items={[regenerate]}
  //     onActionClick={onActionClick}
  //     type="ghost"
  //   />
  // );
});
