import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SideBar from '@/features/SideBar';

const AppLayout = memo<PropsWithChildren>(({ children }) => {
  return (
    <Flexbox horizontal width={'100%'}>
      <SideBar />
      {children}
    </Flexbox>
  );
});

export default AppLayout;
