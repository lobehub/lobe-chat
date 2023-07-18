import { DraggablePanel } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { PropsWithChildren, memo, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { useSettings } from '@/store/settings';

export const useStyles = createStyles(({ css, token }) => ({
  panel: css`
    height: 100vh;
    color: ${token.colorTextSecondary};
    background: ${token.colorBgContainer};
  `,
}));

const FolderPanel = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  const [sessionsWidth, sessionExpandable] = useSettings(
    (s) => [s.sessionsWidth, s.sessionExpandable],
    shallow,
  );
  const [tmpWidth, setWidth] = useState(sessionsWidth);
  if (tmpWidth !== sessionsWidth) setWidth(sessionsWidth);

  return (
    <DraggablePanel
      className={styles.panel}
      defaultSize={{ width: tmpWidth }}
      expand={sessionExpandable}
      maxWidth={400}
      minWidth={256}
      onExpandChange={(expand) => {
        useSettings.setState({
          sessionExpandable: expand,
          sessionsWidth: expand ? 320 : 0,
        });
      }}
      onSizeChange={(_, size) => {
        if (!size) return;

        const nextWidth = typeof size.width === 'string' ? Number.parseInt(size.width) : size.width;

        if (isEqual(nextWidth, sessionsWidth)) return;

        setWidth(nextWidth);
        useSettings.setState({ sessionsWidth: nextWidth });
      }}
      placement="left"
      size={{ height: '100vh', width: sessionsWidth }}
    >
      {children}
    </DraggablePanel>
  );
});

export default FolderPanel;
