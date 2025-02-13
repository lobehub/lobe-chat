import { useServerConfigStore } from '@/store/serverConfig';

import JsonViewer from './JsonViewer';

const ServerConfig = () => {
  const serverConfig = useServerConfigStore((s) => s.serverConfig);

  return <JsonViewer data={serverConfig} />;
};

export default ServerConfig;
