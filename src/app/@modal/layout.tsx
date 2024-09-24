'use client';

import { Modal } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, memo, useEffect, useState } from 'react';

import InterceptingLayout from './features/InterceptingContext';

const InterceptingModal = memo<PropsWithChildren>(({ children }) => {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isDiscover = pathname.startsWith('/discover');
  const theme = useTheme();

  const inModal =
    pathname.startsWith('/settings') ||
    pathname.startsWith('/chat/settings') ||
    pathname.startsWith('/discover/assistant/') ||
    pathname.startsWith('/discover/model/') ||
    pathname.startsWith('/discover/plugin/') ||
    pathname.startsWith('/discover/provider/');

  useEffect(() => {
    if (!inModal) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [inModal, router]);

  if (!inModal) return null;

  return (
    <InterceptingLayout>
      <Modal
        afterClose={() => {
          if (inModal) {
            router.back();
          } else {
            router.refresh();
          }
        }}
        enableResponsive={false}
        footer={null}
        onCancel={() => {
          setOpen(false);
          router.back();
        }}
        open={open}
        styles={{
          body: {
            display: 'flex',
            maxHeight: isDiscover ? '80vh' : undefined,
            minHeight: 750,
            overflow: 'hidden',
            padding: 0,
          },
          content: { border: 'none', boxShadow: `0 0 0 1px ${theme.colorBorderSecondary}` },
        }}
        title={false}
        width={isDiscover ? 'min(80vw, 1280px)' : 'min(80vw, 1024px)'}
      >
        {children}
      </Modal>
    </InterceptingLayout>
  );
});

export default InterceptingModal;
