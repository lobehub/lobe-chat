import { PropsWithChildren, memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';

import SideBar from '@/features/SideBar';
import { createI18nNext } from '@/locales/create';

const initI18n = createI18nNext();

const ChatLayout = memo<PropsWithChildren>(({ children }) => {
  useEffect(() => {
    initI18n.finally();
  }, []);

  return (
    <Flexbox horizontal width={'100%'}>
      <SideBar />
      {children}
    </Flexbox>
  );
});

export default ChatLayout;
