import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ChatItemProps } from '../type';

export interface ActionsProps {
  actions: ChatItemProps['actions'];
}

const Actions = memo<ActionsProps>(({ actions }) => {
  return (
    <Flexbox
      align={'flex-start'}
      role="menubar"
      style={{
        alignSelf: 'flex-end',
      }}
    >
      {actions}
    </Flexbox>
  );
});

export default Actions;
