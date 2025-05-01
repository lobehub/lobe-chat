import { Divider } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useElectronStore } from '@/store/electron';
import { electronStylish } from '@/styles/electron';
import { isMacOS } from '@/utils/platform';

import Connection from './Connection';
import { UpdateModal } from './UpdateModal';
import { UpdateNotification } from './UpdateNotification';
import WinControl from './WinControl';
import { TITLE_BAR_HEIGHT } from './const';

const isMac = isMacOS();

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
      paddingInline={isMac ? 12 : '12px 0'}
      style={{ minHeight: TITLE_BAR_HEIGHT }}
      width={'100%'}
    >
      <div />
      <div>{/* TODO */}</div>

      <Flexbox align={'center'} gap={4} horizontal>
        <Flexbox className={electronStylish.nodrag} gap={8} horizontal>
          <UpdateNotification />
          <Connection />
        </Flexbox>
        {!isMac && (
          <>
            <Divider type={'vertical'} />
            <WinControl />
          </>
        )}
      </Flexbox>
      <UpdateModal />
    </Flexbox>
  );
});

export default TitleBar;

export { TITLE_BAR_HEIGHT } from './const';
