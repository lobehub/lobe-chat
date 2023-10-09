import { PropsWithChildren } from 'react';

import AppLayoutMobile from '@/layout/AppLayout.mobile';

import Header from '../../components/ChatHeader/Mobile';

export default ({ children }: PropsWithChildren) => (
  <AppLayoutMobile navBar={<Header />}>{children}</AppLayoutMobile>
);
