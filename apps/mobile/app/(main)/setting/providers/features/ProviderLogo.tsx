import { ProviderIcon } from '@lobehub/icons-rn';
import { memo } from 'react';

const ProviderLogo = memo<{ provider: string }>(({ provider }) => {
  return <ProviderIcon provider={provider} size={24} />;
});

export default ProviderLogo;
