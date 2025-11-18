'use client';

import { DraggableSideNav, type DraggableSideNavProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';

import SessionPanel from '@/app/[variants]/(main)/chat/components/SessionPanel';
import { TOOGLE_PANEL_BUTTON_ID } from '@/features/NavPanel/Header/components/TogglePanelButton';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import Body from './Body';
import Header from './Header';

export const useStyles = createStyles(({ css, token }) => ({
  panel: css`
    height: 100%;
    color: ${token.colorTextSecondary};
    background: ${token.colorBgLayout};

    #${TOOGLE_PANEL_BUTTON_ID} {
      width: 0 !important;
      opacity: 0;
      transition: opacity 0.2s ${token.motionEaseInOut};
    }

    &:hover {
      #${TOOGLE_PANEL_BUTTON_ID} {
        width: 32px !important;
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
    <DraggableSideNav
      className={styles.panel}
      defaultWidth={tmpWidth}
      expand={sessionExpandable}
      header={(expand) => <Header expand={expand} />}
      maxWidth={400}
      minWidth={48}
      onExpandChange={handleExpand}
      onWidthChange={handleSizeChange}
      placement="left"
      showHandle={false}
      width={sessionsWidth}
    >
      <Body expand={!!sessionExpandable} />
      <SessionPanel mobile={false} />
    </DraggableSideNav>
  );
});

export default NavPanel;
