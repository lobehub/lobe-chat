'use client';

import { Popover } from 'antd';
import { createStyles } from 'antd-style';
import { PropsWithChildren, memo, useEffect, useState } from 'react';

import { useUserStore } from '@/store/user';

import PanelContent from './PanelContent';
import UpgradeBadge from './UpgradeBadge';
import { useNewVersion } from './useNewVersion';

const useStyles = createStyles(({ css }) => ({
  popover: css`
    inset-block-start: 8px !important;
    inset-inline-start: 8px !important;
  `,
}));

const UserPanel = memo<PropsWithChildren>(({ children }) => {
  const hasNewVersion = useNewVersion();
  const [open, setOpen] = useState(false);
  const { styles } = useStyles();
  const userStore = useUserStore();
  useEffect(() => {
    if (userStore.enableAuth() && !userStore.isSignedIn) {
      setOpen(true);
    }
  }, [userStore.isSignedIn]);

  return (
    <UpgradeBadge showBadge={hasNewVersion}>
      <Popover
        arrow={false}
        content={<PanelContent closePopover={() => setOpen(false)} />}
        onOpenChange={setOpen}
        open={open}
        overlayInnerStyle={{ padding: 0 }}
        placement={'topRight'}
        rootClassName={styles.popover}
        trigger={['click']}
      >
        {children}
      </Popover>
    </UpgradeBadge>
  );
});

UserPanel.displayName = 'UserPanel';

export default UserPanel;
