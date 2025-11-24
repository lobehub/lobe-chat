'use client';

import { DraggableSideNav } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import Body from './Body';
import { AgentModalProvider } from './Body/Agent/ModalProvider';
import Footer from './Footer';
import Header from './Header';
import { USER_DROPDOWN_ICON_ID } from './Header/components/User';
import SessionHydration from './SessionHydration';
import { useNavPanel } from './hooks/useNavPanel';

export const useStyles = createStyles(({ css, token }) => ({
  panel: css`
    user-select: none;
    height: 100%;
    color: ${token.colorTextSecondary};
    background: ${token.colorBgLayout};

    * {
      user-select: none;
    }

    #${USER_DROPDOWN_ICON_ID} {
      width: 0 !important;
      opacity: 0;
      transition: opacity 0.2s ${token.motionEaseOut};
    }

    &:hover {
      #${USER_DROPDOWN_ICON_ID} {
        width: 14px !important;
        opacity: 1;
      }
    }
  `,
}));

const NavPanel = memo(() => {
  const { styles } = useStyles();
  const { defaultWidth, handleExpand, expand, handleSizeChange, width } = useNavPanel();

  return (
    <AgentModalProvider>
      <DraggableSideNav
        body={() => <Body />}
        className={styles.panel}
        defaultWidth={defaultWidth}
        expand={expand}
        footer={(expand) => <Footer expand={expand} />}
        header={(expand) => <Header expand={expand} />}
        maxWidth={400}
        minWidth={48}
        onExpandChange={handleExpand}
        onWidthChange={handleSizeChange}
        placement="left"
        showHandle={false}
        width={width}
      />
      <SessionHydration />
    </AgentModalProvider>
  );
});

export default NavPanel;
