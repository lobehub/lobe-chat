import { DraggablePanelBody } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import FolderPanel from '@/features/FolderPanel';

import SessionListContent from '../../features/SessionListContent';
import Header from './SessionHeader';

const useStyles = createStyles(({ stylish, css, cx }) =>
  cx(
    stylish.noScrollbar,
    css`
      padding: 0 6px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    `,
  ),
);

const Sessions = memo(() => {
  const { styles } = useStyles();

  return (
    <FolderPanel>
      <Header />
      <DraggablePanelBody className={styles}>
        <SessionListContent />
      </DraggablePanelBody>
    </FolderPanel>
  );
});

export default Sessions;
