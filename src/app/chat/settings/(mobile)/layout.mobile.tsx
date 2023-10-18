import { PropsWithChildren, memo } from 'react';

import AppLayoutMobile from '@/layout/AppLayout.mobile';

import Header from './features/Header';

export default memo(({ children }: PropsWithChildren) => (
  <AppLayoutMobile navBar={<Header />}>{children}</AppLayoutMobile>
));
