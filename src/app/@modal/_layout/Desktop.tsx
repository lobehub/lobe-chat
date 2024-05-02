'use client';

import { Modal } from '@lobehub/ui';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useState } from 'react';

const Layout = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  return (
    <Modal
      footer={null}
      onCancel={() => {
        setOpen(false);
        setTimeout(() => router.back(), 250);
      }}
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

Layout.displayName = 'ModalLayout';

export default Layout;
