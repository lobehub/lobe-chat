import { FC, PropsWithChildren } from 'react';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return <div style={{ position: 'absolute', zIndex: 0 }}>{children}</div>;
};

export default Layout;
