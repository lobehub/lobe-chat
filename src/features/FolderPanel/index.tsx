import { DraggablePanel, DraggablePanelContainer } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { PropsWithChildren, memo, useState } from 'react';

import { FOLDER_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';

export const useStyles = createStyles(({ css, token }) => ({
  panel: css`
    height: 100%;
    color: ${token.colorTextSecondary};
    background: ${token.colorBgContainer};
  `,
}));

const FolderPanel = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  const [sessionsWidth, sessionExpandable, updatePreference] = useGlobalStore((s) => [
    s.preference.sessionsWidth,
    s.preference.showSessionPanel,
    s.updatePreference,
  ]);
  const [tmpWidth, setWidth] = useState(sessionsWidth);
  if (tmpWidth !== sessionsWidth) setWidth(sessionsWidth);

  return (
    <DraggablePanel
      className={styles.panel}
      defaultSize={{ width: tmpWidth }}
      expand={sessionExpandable}
      maxWidth={400}
      minWidth={FOLDER_WIDTH}
      onExpandChange={(expand) => {
        updatePreference({
          sessionsWidth: expand ? 320 : 0,
          showSessionPanel: expand,
        });
      }}
      onSizeChange={(_, size) => {
        if (!size) return;

        const nextWidth = typeof size.width === 'string' ? Number.parseInt(size.width) : size.width;

        if (isEqual(nextWidth, sessionsWidth)) return;

        setWidth(nextWidth);
        updatePreference({ sessionsWidth: nextWidth });
      }}
      placement="left"
      size={{ height: '100%', width: sessionsWidth }}
    >
      <DraggablePanelContainer style={{ flex: 'none', height: '100%', minWidth: FOLDER_WIDTH }}>
        {children}
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

export default FolderPanel;
