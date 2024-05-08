'use client';

import { Modal } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, memo, useState } from 'react';

const SessionSettingsModal = memo<PropsWithChildren>(({ children }) => {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const theme = useTheme();

  return (
    <Modal
      afterClose={() => {
        router.back();
      }}
      footer={null}
      onCancel={() => setOpen(false)}
      open={open}
      styles={{
        body: { display: 'flex', minHeight: 'min(75vh, 750px)', overflow: 'hidden', padding: 0 },
        content: { border: 'none', boxShadow: `0 0 0 1px ${theme.colorBorderSecondary}` },
      }}
      title={false}
      width={1024}
    >
      {children}
    </Modal>
  );
});

export default SessionSettingsModal;
