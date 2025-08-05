import { memo } from 'react';
import { ProviderIcon } from '@lobehub/icons-rn';

const ProviderLogo = memo<{ provider: string }>(({ provider }) => {
  return <ProviderIcon provider={provider} size={24} />;
});

export default ProviderLogo;
