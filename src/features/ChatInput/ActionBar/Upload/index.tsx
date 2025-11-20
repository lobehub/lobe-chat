import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import ServerMode from './ServerMode';

const Upload = () => {
  const { enableKnowledgeBase } = useServerConfigStore(featureFlagsSelectors);
  return enableKnowledgeBase && <ServerMode />;
};

export default Upload;
