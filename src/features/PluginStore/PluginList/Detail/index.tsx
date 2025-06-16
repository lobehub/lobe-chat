import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DetailProvider } from '@/app/[variants]/(main)/discover/(detail)/plugin/[...slugs]/features/DetailProvider';
import Nav from '@/app/[variants]/(main)/discover/(detail)/plugin/[...slugs]/features/Details/Nav';
import Overview from '@/app/[variants]/(main)/discover/(detail)/plugin/[...slugs]/features/Details/Overview';
import Header from '@/app/[variants]/(main)/discover/(detail)/plugin/[...slugs]/features/Header';
import { useDiscoverStore } from '@/store/discover';
import { PluginNavKey } from '@/types/discover';

import DetailsLoading from './Loading';

const Detail = memo<{ identifier: string }>(({ identifier }) => {
  const [activeTab, setActiveTab] = useState(PluginNavKey.Overview);
  const usePluginDetail = useDiscoverStore((s) => s.usePluginDetail);
  const { data, isLoading } = usePluginDetail({ identifier });
  if (isLoading) return <DetailsLoading />;

  return (
    <DetailProvider config={data}>
      <Flexbox gap={16}>
        <Header inModal />
        <Nav activeTab={activeTab as PluginNavKey} inModal setActiveTab={setActiveTab} />
        <Flexbox gap={24}>{activeTab === PluginNavKey.Overview && <Overview />}</Flexbox>
      </Flexbox>
    </DetailProvider>
  );
});

export default Detail;
