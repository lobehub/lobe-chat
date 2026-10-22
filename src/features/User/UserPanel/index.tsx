'use client';

import { createStaticStyles, Popover } from '@lobehub/ui';
import { type PropsWithChildren } from 'react';
import { memo, Suspense, useState } from 'react';

import { isDesktop } from '@/const/version';
import { useNavPanelHomeActive } from '@/features/NavPanel/NavPanelHomeActiveContext';

import PanelContent from './PanelContent';
import PanelContentSkeleton from './PanelContentSkeleton';
import UpgradeBadge from './UpgradeBadge';
import { useNewVersion } from './useNewVersion';

const styles = createStaticStyles(({ css }) => {
  return {
    popover: css`
      inset-block-start: ${isDesktop ? 32 : 8}px !important;
      inset-inline-start: 8px !important;
      border-radius: 10px;
    `,
    popoverContent: css`
      padding: 0;
    `,
  };
});

interface UserPanelPopoverProps {
  hasNewVersion: boolean;
}

/**
 * Mounted only while the nav panel home layer is on screen, so its `open` state
 * lives exactly as long as the popover can be shown.
 */
const UserPanelPopover = memo<PropsWithChildren<UserPanelPopoverProps>>(
  ({ children, hasNewVersion }) => {
    const [open, setOpen] = useState(false);

    return (
      <Suspense fallback={children}>
        <UpgradeBadge showBadge={hasNewVersion}>
          <Popover
            arrow={false}
            open={open}
            placement="topLeft"
            trigger="click"
            classNames={{
              root: styles.popover,
              content: styles.popoverContent,
            }}
            content={
              <Suspense fallback={<PanelContentSkeleton />}>
                <PanelContent closePopover={() => setOpen(false)} />
              </Suspense>
            }
            onOpenChange={setOpen}
          >
            {children}
          </Popover>
        </UpgradeBadge>
      </Suspense>
    );
  },
);

UserPanelPopover.displayName = 'UserPanelPopover';

const UserPanel = memo<PropsWithChildren>(({ children }) => {
  const hasNewVersion = useNewVersion();
  const isLayerActive = useNavPanelHomeActive();

  // The nav panel keeps the home layer mounted with `<Activity mode="hidden">`
  // while a route-owned panel is active. A hidden Activity tears down effects in
  // the subtree, and its `display: none` cannot clip floating UI that is portaled
  // to `document.body` — so a popover opened here would stay on screen with its
  // dismiss listeners gone (lobehub#21190; the React-level behavior is
  // facebook/react#35000, fixed in facebook/react#35091 / React 19.3.0). Tie the
  // popover, portal included, to the layer being on screen: unmount it in the
  // same commit that hides the layer. Its `open` state is owned by
  // `UserPanelPopover`, so it dies with the popover instead of reopening when the
  // layer comes back.
  if (!isLayerActive) return children;

  return <UserPanelPopover hasNewVersion={hasNewVersion}>{children}</UserPanelPopover>;
});

UserPanel.displayName = 'UserPanel';

export default UserPanel;
