import { type PropsWithChildren } from 'react';

import ServerLayout from '@/components/server/ServerLayout';
import { isServerMode } from '@/const/version';

import NotSupportClient from './NotSupportClient';
import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

const AiImageLayout = ServerLayout({ Desktop, Mobile });

AiImageLayout.displayName = 'AiImageLayout';

const Layout = (props: PropsWithChildren) => {
  if (!isServerMode) return <NotSupportClient />;

  return <AiImageLayout {...props} />;
};

export default Layout;
