'use client';

import { DraggablePanel, DraggablePanelContainer, type DraggablePanelProps } from '@lobehub/ui';
import { createStyles, useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { PropsWithChildren, memo, useEffect, useLayoutEffect, useState } from 'react';

import { FOLDER_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';

export const useStyles = createStyles(({ css, token }) => ({
  panel: css`
    height: 100%;
    color: ${token.colorTextSecondary};
    background: ${token.colorBgContainer};
  `,
}));

const SessionPanel = memo<PropsWithChildren>(({ children }) => {
  const { md = true } = useResponsive();
  const { styles } = useStyles();
  const [sessionsWidth, sessionExpandable, updatePreference, isPreferenceInit] = useGlobalStore(
    (s) => [
      s.preference.sessionsWidth,
      s.preference.showSessionPanel,
      s.updatePreference,
      s.isPreferenceInit,
    ],
  );
  const [expand, setExpand] = useState(sessionExpandable);
  const [tmpWidth, setWidth] = useState(sessionsWidth);
  if (tmpWidth !== sessionsWidth) setWidth(sessionsWidth);

  const handleExpand: DraggablePanelProps['onExpandChange'] = (e) => {
    updatePreference({
      sessionsWidth: e ? 320 : 0,
      showSessionPanel: e,
    });
    setExpand(e);
  };

  const handleSizeChange: DraggablePanelProps['onSizeChange'] = (_, size) => {
    if (!size) return;
    const nextWidth = typeof size.width === 'string' ? Number.parseInt(size.width) : size.width;
    if (isEqual(nextWidth, sessionsWidth)) return;
    setWidth(nextWidth);
    updatePreference({ sessionsWidth: nextWidth });
  };

  useLayoutEffect(() => {
    if (!isPreferenceInit) return;
    setExpand(sessionExpandable);
  }, [isPreferenceInit, sessionExpandable]);

  useEffect(() => {
    if (md && sessionExpandable) setExpand(true);
    if (!md) setExpand(false);
  }, [md, sessionExpandable]);

  return (
    <DraggablePanel
      className={styles.panel}
      defaultSize={{ width: tmpWidth }}
      expand={expand}
      maxWidth={400}
      minWidth={FOLDER_WIDTH}
      mode={md ? 'fixed' : 'float'}
      onExpandChange={handleExpand}
      onSizeChange={handleSizeChange}
      placement="left"
      size={{ height: '100%', width: sessionsWidth }}
    >
      <DraggablePanelContainer style={{ flex: 'none', height: '100%', minWidth: FOLDER_WIDTH }}>
        {children}
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

export default SessionPanel;
