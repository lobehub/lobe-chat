import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useElectronStore } from '@/store/electron';
import { electronStylish } from '@/styles/electron';

import Connection from './Connection';
import { UpdateModal } from './UpdateModal';
import { UpdateNotification } from './UpdateNotification';

export const TITLE_BAR_HEIGHT = 36;

const TitleBar = memo(() => {
  const initElectronAppState = useElectronStore((s) => s.useInitElectronAppState);

  initElectronAppState();

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
        <Connection />
      </Flexbox>
      <UpdateModal />
    </Flexbox>
  );
});

export default TitleBar;
