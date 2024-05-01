'use client';

import { Alert } from '@lobehub/ui';
import { Badge, ConfigProvider, Popover } from 'antd';
import { createStyles } from 'antd-style';
import { PropsWithChildren, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PopoverContent from './Popover';
import { useNewVersion } from './useNewVersion';

const useStyles = createStyles(({ css }) => ({
  popover: css`
    top: 8px !important;
    left: 8px !important;
  `,
}));

const UserPanel = memo<PropsWithChildren<{ bottom?: boolean }>>(({ children, bottom }) => {
  const hasNewVersion = useNewVersion();
  const [open, setOpen] = useState(false);
  const { styles } = useStyles();
  const { t } = useTranslation('common');

  const AvararBadge = useCallback(
    ({ children: badgeChildren, showBadge }: PropsWithChildren<{ showBadge?: boolean }>) => {
      if (bottom || !showBadge) return badgeChildren;
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
    <AvararBadge showBadge={hasNewVersion}>
      <Popover
        arrow={false}
        content={
          <>
            {bottom && <Alert banner message={t('userPanel.warn')} type={'warning'} />}
            <PopoverContent closePopover={() => setOpen(false)} />
          </>
        }
        onOpenChange={setOpen}
        open={open}
        overlayInnerStyle={{
          padding: 0,
        }}
        placement={'topRight'}
        rootClassName={bottom ? undefined : styles.popover}
        trigger={['click']}
      >
        {children}
      </Popover>
    </AvararBadge>
  );
});

UserPanel.displayName = 'UserPanel';

export default UserPanel;
