import { PropsWithChildren } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';

const Layout = ({ children }: PropsWithChildren) => {
  return <MobileContentLayout withNav>{children}</MobileContentLayout>;
};

Layout.displayName = 'MeLayout';

export default Layout;
