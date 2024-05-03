'use client';

import { Modal } from '@lobehub/ui';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';

const SessionSettingsModal = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setOpen(true);
  }, []);

  const cacheRouter = useMemo(() => router, []);

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
};

export default SessionSettingsModal;
