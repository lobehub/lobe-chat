import { PropsWithChildren, memo } from 'react';

import SessionHeader from '@/app/chat/(mobile)/features/SessionHeader';
import AppLayoutMobile from '@/layout/AppLayout.mobile';

export default memo(({ children }: PropsWithChildren) => (
  <AppLayoutMobile navBar={<SessionHeader />} showTabBar>
    {children}
  </AppLayoutMobile>
));
