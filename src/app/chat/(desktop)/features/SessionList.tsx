import { DraggablePanelBody } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import FolderPanel from '@/features/FolderPanel';

import SessionListContent from '../../features/SessionListContent';
import Header from './SessionHeader';

const useStyles = createStyles(({ stylish }) => stylish.noScrollbar);

const Sessions = memo(() => {
  const { styles } = useStyles();

  return (
    <FolderPanel>
      <Header />
      <DraggablePanelBody className={styles} style={{ padding: 0 }}>
        <SessionListContent />
      </DraggablePanelBody>
    </FolderPanel>
  );
});

export default Sessions;
