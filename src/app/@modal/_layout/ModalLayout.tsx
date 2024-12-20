'use client';

import { Modal, type ModalProps } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, memo, useState } from 'react';

const ModalLayout = memo<
  PropsWithChildren<{
    centered?: boolean;
    closeIconProps?: ModalProps['closeIconProps'];
    height?: number | string;
    minHeight?: number | string;
    onCancel?: ModalProps['onCancel'];
    width?: number | string;
  }>
>(
  ({
    closeIconProps,
    centered,
    children,
    height = 'min(80vh,750px)',
    width = 'min(80vw, 1024px)',
    onCancel,
  }) => {
    const [open, setOpen] = useState(true);
    const router = useRouter();
    const theme = useTheme();

    return (
      <Modal
        afterClose={() => router.back()}
        centered={centered}
        closeIconProps={closeIconProps}
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
          body: {
            display: 'flex',
            height: height,
            overflow: 'hidden',
            padding: 0,
            position: 'relative',
          },
          content: { border: 'none', boxShadow: `0 0 0 1px ${theme.colorBorderSecondary}` },
        }}
        title={false}
        width={width}
      >
        {children}
      </Modal>
    );
  },
);

export default ModalLayout;
