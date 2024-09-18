'use client';

import { useResponsive } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Footer from '@/features/Setting/Footer';
import { useInterceptingRoutes } from '@/hooks/useInterceptingRoutes';

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
    const { md = true, xl = true } = useResponsive();
    const { isIntercepted } = useInterceptingRoutes();

    if (mobile || !md || (isIntercepted && !xl))
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

    if (isIntercepted) {
      return (
        <>
          <Flexbox flex={1} gap={24} style={{ overflow: 'hidden', position: 'relative' }}>
            <Flexbox style={{ paddingRight: 16 }}>{header}</Flexbox>
            <Flexbox
              gap={24}
              style={{
                overflowX: 'hidden',
                overflowY: 'auto',
                paddingBottom: 48,
                paddingRight: 16,
                position: 'relative',
              }}
            >
              {children}
              <Footer />
            </Flexbox>
          </Flexbox>
          <SidebarContainer style={{ position: 'sticky', top: '0' }}>
            <Flexbox gap={16} width={'100%'}>
              {actions}
              {statistics}
            </Flexbox>
            {sidebar}
          </SidebarContainer>
        </>
      );
    }

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
