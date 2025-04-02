'use client';

import { Popover } from 'antd';
import { createStyles } from 'antd-style';
import { PropsWithChildren, memo, useState } from 'react';

import { isDesktop } from '@/const/version';

import PanelContent from './PanelContent';
import UpgradeBadge from './UpgradeBadge';
import { useNewVersion } from './useNewVersion';

const useStyles = createStyles(({ css }) => {
  return {
    popover: css`
      inset-block-start: ${isDesktop ? 24 : 8}px !important;
      inset-inline-start: 8px !important;
    `,
  };
});

const UserPanel = memo<PropsWithChildren>(({ children }) => {
  const hasNewVersion = useNewVersion();
  const [open, setOpen] = useState(false);
  const { styles } = useStyles();

  return (
    <UpgradeBadge showBadge={hasNewVersion}>
      <Popover
        arrow={false}
        content={<PanelContent closePopover={() => setOpen(false)} />}
        onOpenChange={setOpen}
        open={open}
        placement={'topRight'}
        rootClassName={styles.popover}
        styles={{
          body: { padding: 0 },
        }}
        trigger={['click']}
      >
        {children}
      </Popover>
    </UpgradeBadge>
  );
});

UserPanel.displayName = 'UserPanel';

export default UserPanel;
