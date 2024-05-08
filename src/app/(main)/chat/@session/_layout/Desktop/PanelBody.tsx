'use client';

import { DraggablePanelBody } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { PropsWithChildren, memo } from 'react';

const useStyles = createStyles(
  ({ css }) => css`
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 8px 0;
  `,
);

const PanelBody = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();

  return <DraggablePanelBody className={styles}>{children}</DraggablePanelBody>;
});

export default PanelBody;
