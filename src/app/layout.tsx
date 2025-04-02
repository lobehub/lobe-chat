import { PropsWithChildren } from 'react';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
};

export default Layout;
