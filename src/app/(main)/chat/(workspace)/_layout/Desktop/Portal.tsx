'use client';

import { DraggablePanel, DraggablePanelContainer } from '@lobehub/ui';
import { createStyles, useResponsive } from 'antd-style';
import { rgba } from 'polished';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import {
  CHAT_PORTAL_MAX_WIDTH,
  CHAT_PORTAL_TOOL_UI_WIDTH,
  CHAT_PORTAL_WIDTH,
} from '@/const/layoutTokens';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, portalThreadSelectors } from '@/store/chat/selectors';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  content: css`
    display: flex;
    flex-direction: column;
    height: 100% !important;
  `,
  drawer: css`
    z-index: 10;
    background: ${token.colorBgLayout};
  `,
  header: css`
    border-block-end: 1px solid ${token.colorBorder};
  `,
  panel: css`
    overflow: hidden;
    height: 100%;
    background: ${isDarkMode ? rgba(token.colorBgElevated, 0.8) : token.colorBgElevated};
  `,

  thread: css`
    background: ${token.colorBgLayout};
  `,
}));

const PortalPanel = memo(({ children }: PropsWithChildren) => {
  const { styles, cx } = useStyles();
  const { md = true } = useResponsive();

  const [showInspector, showToolUI, showArtifactUI, showThread] = useChatStore((s) => [
    chatPortalSelectors.showPortal(s),
    chatPortalSelectors.showPluginUI(s),
    chatPortalSelectors.showArtifactUI(s),
    portalThreadSelectors.showThread(s),
  ]);

  return (
    showInspector && (
      <DraggablePanel
        className={styles.drawer}
        classNames={{
          content: styles.content,
        }}
        expand
        hanlderStyle={{ display: 'none' }}
        maxWidth={CHAT_PORTAL_MAX_WIDTH}
        minWidth={
          showArtifactUI || showToolUI || showThread ? CHAT_PORTAL_TOOL_UI_WIDTH : CHAT_PORTAL_WIDTH
        }
        mode={md ? 'fixed' : 'float'}
        placement={'right'}
        showHandlerWhenUnexpand={false}
        showHandlerWideArea={false}
      >
        <DraggablePanelContainer
          style={{
            flex: 'none',
            height: '100%',
            maxHeight: '100vh',
            minWidth: CHAT_PORTAL_WIDTH,
          }}
        >
          <Flexbox className={cx(styles.panel, showThread && styles.thread)}>{children}</Flexbox>
        </DraggablePanelContainer>
      </DraggablePanel>
    )
  );
});

export default PortalPanel;
