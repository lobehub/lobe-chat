import { Drawer } from 'antd';
import { createStyles } from 'antd-style';
import { useState } from 'react';

import ConnectionMode from './ConnectionMode';
import RemoteStatus from './RemoteStatus';
import WaitingOAuth from './Waiting';

const useStyles = createStyles(({ css }) => {
  return {
    modal: css`
      .ant-drawer-close {
        position: absolute;
        inset-block-start: 8px;
        inset-inline-end: 0;
      }
    `,
  };
});

const Connection = () => {
  const { styles, theme } = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [isWaiting, setWaiting] = useState(false);

  return (
    <>
      <RemoteStatus
        onClick={() => {
          setIsOpen(true);
        }}
      />
      <Drawer
        classNames={{ header: styles.modal }}
        height={'100vh'}
        onClose={() => {
          setIsOpen(false);
        }}
        open={isOpen}
        placement={'top'}
        style={{
          background: theme.colorBgLayout,
        }}
        styles={{ body: { padding: 0 }, header: { padding: 0 } }}
      >
        {isWaiting ? (
          <WaitingOAuth setIsOpen={setIsOpen} setWaiting={setWaiting} />
        ) : (
          <ConnectionMode setIsOpen={setIsOpen} setWaiting={setWaiting} />
        )}
      </Drawer>
    </>
  );
};

export default Connection;
