import { PropsWithChildren } from 'react';

import { isServerMode } from '@/const/version';

import NotSupportClient from './NotSupportClient';

export default (props: PropsWithChildren) => {
  const { children } = props;

  // if there is client db mode , tell user to switch to server mode
  if (!isServerMode) return <NotSupportClient />;

  // We're using SPA routing now, so we ignore the Next.js parallel routes
  // and use our Client component instead
  return children;
};
