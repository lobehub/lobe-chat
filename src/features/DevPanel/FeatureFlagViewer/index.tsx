import { getServerFeatureFlagsValue } from '@/config/featureFlags';

import FeatureFlagForm from './Form';

const FeatureFlagViewer = () => {
  const serverFeatureFlags = getServerFeatureFlagsValue();

  return <FeatureFlagForm flags={serverFeatureFlags} />;
};

export default FeatureFlagViewer;
