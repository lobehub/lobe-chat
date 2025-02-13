import { useAiInfraStore } from '@/store/aiInfra';

import JsonViewer from './JsonViewer';

const AiProviderRuntimeConfig = () => {
  const aiProviderRuntimeConfig = useAiInfraStore((s) => s.aiProviderRuntimeConfig);

  return <JsonViewer data={aiProviderRuntimeConfig} />;
};

export default AiProviderRuntimeConfig;
