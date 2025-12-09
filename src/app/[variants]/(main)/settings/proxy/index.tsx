'use client';

import ProxyForm from './features/ProxyForm';

const ProxySettings = () => {
  return (
    <div style={{ maxWidth: '1024px', width: '100%' }}>
      <ProxyForm />
    </div>
  );
};

ProxySettings.displayName = 'ProxySettings';

export default ProxySettings;
