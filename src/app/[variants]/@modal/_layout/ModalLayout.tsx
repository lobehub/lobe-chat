'use client';

import { Modal, type ModalProps } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';

const ModalLayout = memo<ModalProps>(
  ({
    children,
    height = 'min(80vh,750px)',
    width = 'min(80vw, 1024px)',
    onCancel,
    afterClose,
    styles,
    ...rest
  }) => {
    const [open, setOpen] = useState(true);
    const router = useRouter();
    const theme = useTheme();

    return (
      <Modal
        afterClose={() => {
          afterClose?.();
          router.back();
        }}
        enableResponsive={false}
        footer={null}
        height={height}
        onCancel={(e) => {
          onCancel?.(e);
          setOpen(false);
          router.back();
        }}
        open={open}
        styles={{
          ...styles,
          body: {
            display: 'flex',
            height: height,
            overflow: 'hidden',
            padding: 0,
            position: 'relative',
            ...styles?.body,
          },
          content: {
            border: 'none',
            boxShadow: `0 0 0 1px ${theme.colorBorderSecondary}`,
            ...styles?.content,
          },
        }}
        title={false}
        width={width}
        {...rest}
      >
        {children}
      </Modal>
    );
  },
);

export default ModalLayout;
