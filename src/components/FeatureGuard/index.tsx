import { type FC, type ReactNode } from 'react';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

type FeatureFlag = keyof ReturnType<typeof featureFlagsSelectors>;

interface FeatureGuardProps {
  feature: FeatureFlag;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * FeatureGuard component - conditionally render children based on feature flag
 * 
 * @example
 * ```tsx
 * <FeatureGuard feature="enableMCP">
 *   <MCPSettings />
 * </FeatureGuard>
 * ```
 * 
 * @example
 * ```tsx
 * <FeatureGuard feature="enableKnowledgeBase" fallback={<div>Knowledge Base is disabled</div>}>
 *   <KnowledgeBaseUI />
 * </FeatureGuard>
 * ```
 */
export const FeatureGuard: FC<FeatureGuardProps> = ({ feature, children, fallback = null }) => {
  const featureFlags = useServerConfigStore(featureFlagsSelectors);
  const isEnabled = featureFlags[feature];

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default FeatureGuard;
