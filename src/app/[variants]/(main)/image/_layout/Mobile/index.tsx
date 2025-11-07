import NProgress from '@/components/NProgress';
import { PropsWithChildren } from 'react';

const Layout = (props: PropsWithChildren) => {
  return (
    <>
      <NProgress />
      {props.children}
    </>
  );
};

Layout.displayName = 'MobileAiImageLayout';

export default Layout;
