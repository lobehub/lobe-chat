'use client';

import { DraggablePanel, DraggablePanelContainer } from '@lobehub/ui';
import { createStyles, useResponsive } from 'antd-style';
import { rgba } from 'polished';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { CHAT_DOCK_TOOL_UI_WIDTH, CHAT_DOCK_WIDTH, MAX_WIDTH } from '@/const/layoutTokens';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/slices/portal/selectors';

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
    margin: 4px;

    background: ${isDarkMode ? rgba(token.colorBgElevated, 0.8) : token.colorBgElevated};
    border-radius: 8px;
  `,
}));

const PortalPanel = memo(({ children }: PropsWithChildren) => {
  const { styles } = useStyles();
  const { md = true } = useResponsive();

  const [showInspector, showToolUI] = useChatStore((s) => [
    chatPortalSelectors.showPortal(s),
    chatPortalSelectors.showArtifactUI(s),
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
        maxWidth={MAX_WIDTH}
        minWidth={showToolUI ? CHAT_DOCK_TOOL_UI_WIDTH : CHAT_DOCK_WIDTH}
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
            minWidth: CHAT_DOCK_WIDTH,
          }}
        >
          <SafeSpacing />
          <Flexbox className={styles.panel}>{children}</Flexbox>
        </DraggablePanelContainer>
      </DraggablePanel>
    )
  );
});

export default PortalPanel;
