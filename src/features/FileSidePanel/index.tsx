'use client';

import { DraggablePanel, DraggablePanelContainer, type DraggablePanelProps } from '@lobehub/ui';
import { createStyles, useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { PropsWithChildren, memo, useEffect, useState } from 'react';

import { FOLDER_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

export const useStyles = createStyles(({ css, token }) => ({
  panel: css`
    height: 100%;
    background: ${token.colorBgContainer};
  `,
}));

const FileSidePanel = memo<PropsWithChildren>(({ children }) => {
  const { md = true } = useResponsive();

  const { styles } = useStyles();
  const [filePanelWidth, showFilePanel, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.filePanelWidth(s),
    systemStatusSelectors.showFilePanel(s),
    s.updateSystemStatus,
  ]);

  const [tmpWidth, setWidth] = useState(filePanelWidth);
  if (tmpWidth !== filePanelWidth) setWidth(filePanelWidth);
  const [cacheExpand, setCacheExpand] = useState<boolean>(Boolean(showFilePanel));

  const handleExpand = (expand: boolean) => {
    if (isEqual(expand, showFilePanel)) return;
    updateSystemStatus({ showFilePanel: expand });
    setCacheExpand(expand);
  };
  useEffect(() => {
    if (md && cacheExpand) updateSystemStatus({ showFilePanel: true });
    if (!md) updateSystemStatus({ showFilePanel: false });
  }, [md, cacheExpand]);

  const handleSizeChange: DraggablePanelProps['onSizeChange'] = (_, size) => {
    if (!size) return;
    const nextWidth = typeof size.width === 'string' ? Number.parseInt(size.width) : size.width;
    if (!nextWidth) return;

    if (isEqual(nextWidth, filePanelWidth)) return;
    setWidth(nextWidth);
    updateSystemStatus({ filePanelWidth: nextWidth });
  };

  return (
    <DraggablePanel
      className={styles.panel}
      defaultSize={{ width: tmpWidth }}
      expand={showFilePanel}
      maxWidth={320}
      minWidth={FOLDER_WIDTH}
      mode={md ? 'fixed' : 'float'}
      onExpandChange={handleExpand}
      onSizeChange={handleSizeChange}
      placement="left"
      size={{ height: '100%', width: filePanelWidth }}
    >
      <DraggablePanelContainer
        style={{
          flex: 'none',
          height: '100%',
          minWidth: FOLDER_WIDTH,
        }}
      >
        {children}
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

export default FileSidePanel;
