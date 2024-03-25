'use client';

import { DraggablePanelBody } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import Header from '@/app/chat/(desktop)/features/SessionHeader';
import SessionListContent from '@/app/chat/features/SessionListContent';
import FolderPanel from '@/features/FolderPanel';

const useStyles = createStyles(({ stylish, css, cx }) =>
  cx(
    stylish.noScrollbar,
    css`
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 8px 8px 0;
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
