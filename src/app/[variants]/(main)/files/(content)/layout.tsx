import { isServerMode } from '@/const/version';

import Client from './Client';
import NotSupportClient from './NotSupportClient';

export default () => {
  // if there is client db mode , tell user to switch to server mode
  if (!isServerMode) return <NotSupportClient />;

  return <Client />;
};
