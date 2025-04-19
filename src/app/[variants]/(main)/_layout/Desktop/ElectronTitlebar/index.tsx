import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { electronStylish } from '@/styles/electron';

import Sync from './Sync';
import { UpdateNotification } from './UpdateNotification';

export const TITLE_BAR_HEIGHT = 36;

const TitleBar = memo(() => {
  return (
    <Flexbox
      align={'center'}
      className={electronStylish.draggable}
      height={TITLE_BAR_HEIGHT}
      horizontal
      justify={'space-between'}
      paddingInline={12}
      style={{ minHeight: TITLE_BAR_HEIGHT }}
      width={'100%'}
    >
      <div />
      <div>{/* TODO */}</div>

      <Flexbox className={electronStylish.nodrag} gap={8} horizontal>
        <UpdateNotification />
        <Sync />
      </Flexbox>
    </Flexbox>
  );
});

export default TitleBar;
