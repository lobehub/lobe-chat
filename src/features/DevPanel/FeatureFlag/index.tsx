import { getServerFeatureFlagsValue } from '@/config/featureFlags';
import FeatureFlagForm from '@/features/DevPanel/FeatureFlag/Form';

const FeatureFlag = () => {
  const serverFeatureFlags = getServerFeatureFlagsValue();

  return <FeatureFlagForm flags={serverFeatureFlags} />;
};

export default FeatureFlag;
