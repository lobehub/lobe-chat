'use client';

import { DraggablePanelBody } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { PropsWithChildren, memo } from 'react';

const useStyles = createStyles(
  ({ css }) => css`
    display: flex;
    flex-direction: column;
    gap: 2px;

    padding-block: 8px 0;
    padding-inline: 8px;
  `,
);

const PanelBody = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();

  return <DraggablePanelBody className={styles}>{children}</DraggablePanelBody>;
});

export default PanelBody;
