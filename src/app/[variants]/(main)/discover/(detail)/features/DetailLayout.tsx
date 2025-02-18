'use client';

import { useResponsive } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Footer from '@/features/Setting/Footer';

import SidebarContainer from './SidebarContainer';

interface DetailLayoutProps {
  actions?: ReactNode;
  children?: ReactNode;
  header: ReactNode;
  mobile?: boolean;
  sidebar?: ReactNode;
  statistics?: ReactNode;
}

const DetailLayout = memo<DetailLayoutProps>(
  ({ statistics, mobile, header, sidebar, children, actions }) => {
    const { md = true } = useResponsive();

    if (mobile || !md)
      return (
        <>
          {header}
          <Flexbox gap={16} width={'100%'}>
            {actions}
            {statistics}
          </Flexbox>
          {children}
          {sidebar}
          <Footer />
        </>
      );

    return (
      <>
        {header}
        <Flexbox gap={32} horizontal width={'100%'}>
          <Flexbox flex={1} gap={48} style={{ overflow: 'hidden', position: 'relative' }}>
            {children}
            <Footer />
          </Flexbox>
          <SidebarContainer>
            <Flexbox gap={16} width={'100%'}>
              {actions}
              {statistics}
            </Flexbox>
            {sidebar}
          </SidebarContainer>
        </Flexbox>
      </>
    );
  },
);

export default DetailLayout;
