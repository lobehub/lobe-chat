import { DraggablePanelBody } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';

import FolderPanel from '@/features/FolderPanel';

import Header from './Header';

const useStyles = createStyles(({ stylish }) => stylish.noScrollbar);

const Sessions = memo<{ children: ReactNode }>(({ children }) => {
  const { styles } = useStyles();

  return (
    <FolderPanel>
      <Header />
      <DraggablePanelBody className={styles} style={{ padding: 0 }}>
        {children}
      </DraggablePanelBody>
    </FolderPanel>
  );
});

export default Sessions;
