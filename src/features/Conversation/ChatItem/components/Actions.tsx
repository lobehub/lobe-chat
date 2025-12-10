import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ChatItemProps } from '../type';

export interface ActionsProps {
  actions: ChatItemProps['actions'];
  placement?: ChatItemProps['placement'];
}

const Actions = memo<ActionsProps>(({ placement, actions }) => {
  const isUser = placement === 'right';
  return (
    <Flexbox
      align={'center'}
      direction={'horizontal'}
      gap={8}
      role="menubar"
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      {actions}
    </Flexbox>
  );
});

export default Actions;
