'use client';

import { createStyles } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ModalLayout from '../../_layout/ModalLayout';
import Hero from './features/Hero';
import Pagination from './features/Pagination';

const useStyles = createStyles(
  ({ css, prefixCls, token }) => css`
    .${prefixCls}-modal-close {
      border: 1px solid ${token.colorBorderSecondary};
      background: ${token.colorBgElevated} !important;
    }
  `,
);

const Layout = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();

  return (
    <ModalLayout centered className={styles} height={'min(90vh, 800px)'} width={'min(90vw, 600px)'}>
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
});

export default Layout;

export const dynamic = 'force-dynamic';
