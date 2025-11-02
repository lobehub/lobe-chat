import { isServerMode } from '@/const/version';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import ClientMode from './ClientMode';
import ServerMode from './ServerMode';

const Upload = () => {
  const { enableFileUpload, enableKnowledgeBase } = useServerConfigStore(featureFlagsSelectors);

  if (!enableFileUpload) return null;

  return isServerMode && enableKnowledgeBase ? <ServerMode /> : <ClientMode />;
};

export default Upload;
