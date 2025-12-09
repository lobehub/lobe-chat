import { type Ref, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useStyles } from '../style';
import { ChatItemProps } from '../type';

export interface ActionsProps {
  actions: ChatItemProps['actions'];
  placement?: ChatItemProps['placement'];
  ref?: Ref<HTMLDivElement>;
}

const Actions = memo<ActionsProps>(({ actions, placement, ref }) => {
  const { styles } = useStyles({ placement });

  return (
    <Flexbox align={'flex-start'} className={styles.actions} ref={ref} role="menubar">
      {actions}
    </Flexbox>
  );
});

export default Actions;
