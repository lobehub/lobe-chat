import { isServerMode } from '@/const/version';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import ClientMode from './ClientMode';
import ServerMode from './ServerMode';

const Upload = () => {
  const { enableKnowledgeBase } = useServerConfigStore(featureFlagsSelectors);
  return isServerMode && enableKnowledgeBase ? <ServerMode /> : <ClientMode />;
};

export default Upload;
