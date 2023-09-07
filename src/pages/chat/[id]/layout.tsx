import { PropsWithChildren, memo } from 'react';

import { usePluginStore } from '@/store/plugin';

import ChatLayout from '../layout';

const Layout = memo<PropsWithChildren>(({ children }) => {
  const useFetchPluginList = usePluginStore((s) => s.useFetchPluginList);

  useFetchPluginList();

  return <ChatLayout>{children}</ChatLayout>;
});

export default Layout;
