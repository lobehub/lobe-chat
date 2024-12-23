'use client';

import { createStyles } from 'antd-style';
import { FC, PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';

import ModalLayout from '../_layout/ModalLayout';
import Hero from './features/Hero';
import Pagination from './features/Pagination';

const useStyles = createStyles(
  ({ css, prefixCls, token }) => css`
    .${prefixCls}-modal-close {
      background: ${token.colorBgElevated} !important;
      border: 1px solid ${token.colorBorderSecondary};
    }
  `,
);

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const { styles } = useStyles();
  const [useCheckLatestChangelogId, updateSystemStatus] = useGlobalStore((s) => [
    s.useCheckLatestChangelogId,
    s.updateSystemStatus,
  ]);
  const { data } = useCheckLatestChangelogId();

  return (
    <ModalLayout
      centered
      className={styles}
      height={'min(90vh, 800px)'}
      onCancel={() => {
        if (!data) return;
        console.log(data);
        updateSystemStatus({ latestChangelogId: data });
      }}
      width={'min(90vw, 600px)'}
    >
      <Flexbox
        style={{ overflowX: 'hidden', overflowY: 'auto', position: 'relative' }}
        width={'100%'}
      >
        <Hero />
        {children}
        <Flexbox padding={24}>
          <Pagination />
        </Flexbox>
      </Flexbox>
    </ModalLayout>
  );
};

export default Layout;
