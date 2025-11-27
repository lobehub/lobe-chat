'use client';

import { DraggablePanel, DraggablePanelContainer, type DraggablePanelProps } from '@lobehub/ui';
import { createStyles, useResponsive, useThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useEffect, useMemo, useState } from 'react';

import { withSuspense } from '@/components/withSuspense';
import { FOLDER_WIDTH } from '@/const/layoutTokens';
import { useIsSingleMode } from '@/hooks/useIsSingleMode';
import { usePinnedAgentState } from '@/hooks/usePinnedAgentState';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import SessionPanelContent from '../../components/SessionPanel';
import { TOOGLE_PANEL_BUTTON_ID } from '../../features/TogglePanelButton';

export const useStyles = createStyles(({ css, token }) => ({
  panel: css`
    height: 100%;
    color: ${token.colorTextSecondary};
    background: ${token.colorBgLayout};

    #${TOOGLE_PANEL_BUTTON_ID} {
      opacity: 0;
      transition: opacity 0.15s ${token.motionEaseInOut};
    }

    &:hover {
      #${TOOGLE_PANEL_BUTTON_ID} {
        opacity: 1;
      }
    }
  `,
}));

const SessionPanel = memo(() => {
  const isSingleMode = useIsSingleMode();

  const { md = true } = useResponsive();

  const [isPinned] = usePinnedAgentState();

  const { styles } = useStyles();

  const [sessionsWidth, sessionExpandable, updatePreference] = useGlobalStore((s) => [
    systemStatusSelectors.sessionWidth(s),
    systemStatusSelectors.showSessionPanel(s),
    s.updateSystemStatus,
  ]);

  const [cacheExpand, setCacheExpand] = useState<boolean>(Boolean(sessionExpandable));
  const [tmpWidth, setWidth] = useState(sessionsWidth);
  if (tmpWidth !== sessionsWidth) setWidth(sessionsWidth);

  const handleExpand = (expand: boolean) => {
    if (isEqual(expand, sessionExpandable)) return;
    updatePreference({ showSessionPanel: expand });
    setCacheExpand(expand);
  };

  const handleSizeChange: DraggablePanelProps['onSizeChange'] = (_, size) => {
    if (!size) return;
    const nextWidth = typeof size.width === 'string' ? Number.parseInt(size.width) : size.width;
    if (!nextWidth) return;

    if (isEqual(nextWidth, sessionsWidth)) return;
    setWidth(nextWidth);
    updatePreference({ sessionsWidth: nextWidth });
  };

  useEffect(() => {
    if (md && cacheExpand) updatePreference({ showSessionPanel: true });
    if (!md) updatePreference({ showSessionPanel: false });
  }, [md, cacheExpand]);

  const { appearance } = useThemeMode();

  const PanelContent = useMemo(() => {
    if (isSingleMode) {
      // 在单一模式下，仍然渲染 SessionPanelContent 以确保 SessionHydration 等逻辑组件正常工作
      // 但使用隐藏样式而不是 return null
      return (
        <div style={{ display: 'none' }}>
          <SessionPanelContent mobile={false} />
        </div>
      );
    }

    return (
      <DraggablePanel
        className={styles.panel}
        defaultSize={{ width: tmpWidth }}
        // 当进入 pin 模式下，不可展开
        expand={!isPinned && sessionExpandable}
        expandable={!isPinned}
        maxWidth={400}
        minWidth={FOLDER_WIDTH}
        mode={md ? 'fixed' : 'float'}
        onExpandChange={handleExpand}
        onSizeChange={handleSizeChange}
        placement="left"
        size={{ height: '100%', width: sessionsWidth }}
      >
        <DraggablePanelContainer style={{ flex: 'none', height: '100%', minWidth: FOLDER_WIDTH }}>
          <SessionPanelContent mobile={false} />
        </DraggablePanelContainer>
      </DraggablePanel>
    );
  }, [sessionsWidth, md, isPinned, sessionExpandable, tmpWidth, appearance, isSingleMode]);

  return PanelContent;
});

export default withSuspense(SessionPanel);
