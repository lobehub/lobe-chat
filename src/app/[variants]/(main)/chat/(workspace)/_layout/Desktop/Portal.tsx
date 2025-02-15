'use client';

import { DraggablePanel, DraggablePanelContainer, type DraggablePanelProps } from '@lobehub/ui';
import { createStyles, useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { rgba } from 'polished';
import { PropsWithChildren, memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import {
  CHAT_PORTAL_MAX_WIDTH,
  CHAT_PORTAL_TOOL_UI_WIDTH,
  CHAT_PORTAL_WIDTH,
} from '@/const/layoutTokens';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, portalThreadSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

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

  const [portalWidth, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.portalWidth(s),
    s.updateSystemStatus,
  ]);

  const [tmpWidth, setWidth] = useState(portalWidth);
  if (tmpWidth !== portalWidth) setWidth(portalWidth);

  const handleSizeChange: DraggablePanelProps['onSizeChange'] = (_, size) => {
    if (!size) return;
    const nextWidth = typeof size.width === 'string' ? Number.parseInt(size.width) : size.width;
    if (!nextWidth) return;

    if (isEqual(nextWidth, portalWidth)) return;
    setWidth(nextWidth);
    updateSystemStatus({ portalWidth: nextWidth });
  };

  return (
    showInspector && (
      <DraggablePanel
        className={styles.drawer}
        classNames={{
          content: styles.content,
        }}
        defaultSize={{ width: tmpWidth }}
        expand
        hanlderStyle={{ display: 'none' }}
        maxWidth={CHAT_PORTAL_MAX_WIDTH}
        minWidth={
          showArtifactUI || showToolUI || showThread ? CHAT_PORTAL_TOOL_UI_WIDTH : CHAT_PORTAL_WIDTH
        }
        mode={md ? 'fixed' : 'float'}
        onSizeChange={handleSizeChange}
        placement={'right'}
        showHandlerWhenUnexpand={false}
        showHandlerWideArea={false}
        size={{ height: '100%', width: portalWidth }}
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
