'use client';

import { isCustomBranding } from '@/const/version';

import { useProviderList } from './ProviderList/providers';
import ProviderConfig from './components/ProviderConfig';
import Footer from './features/Footer';

const Page = () => {
  const list = useProviderList();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {list.map(({ id, ...res }) => (
        <ProviderConfig id={id as any} key={id} {...res} />
      ))}
      {!isCustomBranding && <Footer />}
    </div>
  );
};

Page.displayName = 'LlmSetting';

export default Page;
