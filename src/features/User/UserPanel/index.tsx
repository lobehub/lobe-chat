'use client';

import { Badge, ConfigProvider, Popover } from 'antd';
import { createStyles } from 'antd-style';
import { PropsWithChildren, memo, useCallback, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import PopoverContent from './Popover';
import { useNewVersion } from './useNewVersion';

const useStyles = createStyles(({ css }) => ({
  popover: css`
    top: 8px !important;
    left: 8px !important;
  `,
}));

const UserPanel = memo<PropsWithChildren>(({ children }) => {
  const hasNewVersion = useNewVersion();
  const [open, setOpen] = useState(false);
  const { styles } = useStyles();

  const AvatarBadge = useCallback(
    ({ children: badgeChildren, showBadge }: PropsWithChildren<{ showBadge?: boolean }>) => {
      if (!showBadge) return badgeChildren;

      return (
        <Flexbox>
          <ConfigProvider theme={{ components: { Badge: { dotSize: 8 } } }}>
            <Badge dot offset={[-4, 4]}>
              {badgeChildren}
            </Badge>
          </ConfigProvider>
        </Flexbox>
      );
    },
    [],
  );

  return (
    <AvatarBadge showBadge={hasNewVersion}>
      <Popover
        arrow={false}
        content={<PopoverContent closePopover={() => setOpen(false)} />}
        onOpenChange={setOpen}
        open={open}
        overlayInnerStyle={{
          padding: 0,
        }}
        placement={'topRight'}
        rootClassName={styles.popover}
        trigger={['click']}
      >
        {children}
      </Popover>
    </AvatarBadge>
  );
});

UserPanel.displayName = 'UserPanel';

export default UserPanel;
