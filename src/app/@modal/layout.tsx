'use client';

import { Modal } from '@lobehub/ui';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, memo, useMemo, useState } from 'react';

const SessionSettingsModal = memo<PropsWithChildren>(({ children }) => {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const cacheRouter = useMemo(() => router, [open]);

  return (
    <Modal
      afterClose={() => {
        cacheRouter.back();
      }}
      footer={null}
      onCancel={() => setOpen(false)}
      open={open}
      styles={{
        body: { display: 'flex', minHeight: 'min(75vh, 750px)', overflow: 'hidden', padding: 0 },
      }}
      title={false}
      width={1024}
    >
      {children}
    </Modal>
  );
});

export default SessionSettingsModal;
