import { getServerConfig } from '@/config/server';

import Page from './index';

export default () => {
  const { ENABLE_OLLAMA } = getServerConfig();

  return <Page showOllama={ENABLE_OLLAMA} />;
};
