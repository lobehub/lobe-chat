'use client';

import { DraggableSideNav, type DraggableSideNavProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import Body from './Body';
import { AgentModalProvider } from './Body/Agent/ModalProvider';
import Footer from './Footer';
import Header from './Header';
import { TOOGLE_PANEL_BUTTON_ID } from './Header/components/TogglePanelButton';
import { USER_DROPDOWN_ICON_ID } from './Header/components/User';
import SessionHydration from './SessionHydration';

export const useStyles = createStyles(({ css, token }) => ({
  panel: css`
    user-select: none;
    height: 100%;
    color: ${token.colorTextSecondary};
    background: ${token.colorBgLayout};

    * {
      user-select: none;
    }

    #${TOOGLE_PANEL_BUTTON_ID} {
      width: 0 !important;
      opacity: 0;
      transition: opacity 0.2s ${token.motionEaseOut};
    }

    #${USER_DROPDOWN_ICON_ID} {
      width: 0 !important;
      opacity: 0;
      transition: opacity 0.2s ${token.motionEaseOut};
    }

    &:hover {
      #${TOOGLE_PANEL_BUTTON_ID} {
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

  const [sessionsWidth, sessionExpandable, updatePreference] = useGlobalStore((s) => [
    systemStatusSelectors.sessionWidth(s),
    systemStatusSelectors.showSessionPanel(s),
    s.updateSystemStatus,
  ]);

  const [tmpWidth, setWidth] = useState(sessionsWidth);
  if (tmpWidth !== sessionsWidth) setWidth(sessionsWidth);

  const handleExpand = (expand: boolean) => {
    if (isEqual(expand, sessionExpandable)) return;
    updatePreference({ showSessionPanel: expand });
  };

  const handleSizeChange: DraggableSideNavProps['onWidthChange'] = (_, width) => {
    if (!sessionExpandable || !width || width < 64) return;
    if (isEqual(width, sessionsWidth)) return;
    setWidth(width);
    updatePreference({ sessionsWidth: width });
  };

  return (
    <AgentModalProvider>
      <DraggableSideNav
        body={() => <Body />}
        className={styles.panel}
        defaultWidth={tmpWidth}
        expand={sessionExpandable}
        footer={() => <Footer expand={sessionExpandable} />}
        header={() => <Header expand={sessionExpandable} />}
        maxWidth={400}
        minWidth={48}
        onExpandChange={handleExpand}
        onWidthChange={handleSizeChange}
        placement="left"
        showHandle={false}
        width={sessionsWidth}
      />
      <SessionHydration />
    </AgentModalProvider>
  );
});

export default NavPanel;
