'use client';

import { DraggablePanel } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { AnimatePresence, motion } from 'framer-motion';
import { PropsWithChildren, ReactNode, memo, useLayoutEffect, useSyncExternalStore } from 'react';

import { USER_DROPDOWN_ICON_ID } from '@/app/[variants]/(main)/home/_layout/Header/components/User';
import { TOGGLE_BUTTON_ID } from '@/features/NavPanel/components/TogglePanelButton';

import Sidebar from '../../app/[variants]/(main)/home/_layout/Sidebar';
import { useNavPanel } from './hooks/useNavPanel';

export const NAV_PANEL_RIGHT_DRAWER_ID = 'nav-panel-drawer';

type NavPanelSnapshot = {
  key: string;
  node: ReactNode;
} | null;

let currentSnapshot: NavPanelSnapshot = null;
const listeners = new Set<() => void>();

const subscribeNavPanel = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getNavPanelSnapshot = () => currentSnapshot;
const setNavPanelSnapshot = (snapshot: NavPanelSnapshot) => {
  currentSnapshot = snapshot;
  listeners.forEach((listener) => listener());
};

export const useStyles = createStyles(({ css, token }) => ({
  panel: css`
    user-select: none;
    height: 100%;
    color: ${token.colorTextSecondary};
    background: ${token.colorBgLayout};

    * {
      user-select: none;
    }

    #${TOGGLE_BUTTON_ID} {
      width: 0 !important;
      opacity: 0;
      transition:
        opacity,
        width 0.2s ${token.motionEaseOut};
    }

    #${USER_DROPDOWN_ICON_ID} {
      width: 0 !important;
      opacity: 0;
      transition:
        opacity,
        width 0.2s ${token.motionEaseOut};
    }

    &:hover {
      #${TOGGLE_BUTTON_ID} {
        width: 32px !important;
        opacity: 1;
      }

      #${USER_DROPDOWN_ICON_ID} {
        width: 14px !important;
        opacity: 1;
      }
    }
  `,
}));

const NavPanel = memo(() => {
  const { styles } = useStyles();
  const { expand, handleSizeChange, width, togglePanel } = useNavPanel();
  const panelContent = useSyncExternalStore(
    subscribeNavPanel,
    getNavPanelSnapshot,
    getNavPanelSnapshot,
  );

  // Use home Content as fallback when no portal content is provided
  const activeContent = panelContent || { key: 'home', node: <Sidebar /> };

  return (
    <>
      <DraggablePanel
        className={styles.panel}
        defaultSize={{ height: '100%', width }}
        expand={expand}
        expandable={false}
        maxWidth={400}
        minWidth={240}
        onExpandChange={(expand) => togglePanel(expand)}
        onSizeChange={handleSizeChange}
        placement="left"
        showBorder={false}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: '-20%',
            }}
            initial={{
              opacity: 0,
              x: 0,
            }}
            key={activeContent.key}
            style={{
              flexDirection: 'column',
              height: '100%',
              inset: 0,
              minWidth: 240,
              overflow: 'hidden',
              position: 'relative',
            }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {activeContent.node}
          </motion.div>
        </AnimatePresence>
      </DraggablePanel>
      <div
        id={NAV_PANEL_RIGHT_DRAWER_ID}
        style={{
          height: '100%',
          position: 'relative',
          width: 0,
        }}
      />
    </>
  );
});

export default NavPanel;

interface NavPanelPortalProps extends PropsWithChildren {
  /**
   * Unique key to trigger transition animation when content changes
   * @example <NavPanelPortal navKey="chat">...</NavPanelPortal>
   */
  navKey?: string;
}

export const NavPanelPortal = memo<NavPanelPortalProps>(({ children, navKey = 'default' }) => {
  useLayoutEffect(() => {
    if (!children) return;

    setNavPanelSnapshot({
      key: navKey,
      node: children,
    });
    // Intentionally keep previous content until new one mounts.
  }, [children, navKey]);

  return null;
});
