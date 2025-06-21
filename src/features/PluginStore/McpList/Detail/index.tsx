import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DetailProvider } from '@/app/[variants]/(main)/discover/(detail)/mcp/[...slugs]/features/DetailProvider';
import Deployment from '@/app/[variants]/(main)/discover/(detail)/mcp/[...slugs]/features/Details/Deployment';
import Nav from '@/app/[variants]/(main)/discover/(detail)/mcp/[...slugs]/features/Details/Nav';
import Overview from '@/app/[variants]/(main)/discover/(detail)/mcp/[...slugs]/features/Details/Overview';
import Schema from '@/app/[variants]/(main)/discover/(detail)/mcp/[...slugs]/features/Details/Schema';
import Score from '@/app/[variants]/(main)/discover/(detail)/mcp/[...slugs]/features/Details/Score';
import Header from '@/app/[variants]/(main)/discover/(detail)/mcp/[...slugs]/features/Header';
import { useDiscoverStore } from '@/store/discover';
import { McpNavKey } from '@/types/discover';

import DetailsLoading from './Loading';

const Detail = memo<{ identifier: string }>(({ identifier }) => {
  const [activeTab, setActiveTab] = useState(McpNavKey.Overview);
  const useMcpDetail = useDiscoverStore((s) => s.useMcpDetail);
  const { data, isLoading } = useMcpDetail({ identifier });
  if (isLoading) return <DetailsLoading />;

  return (
    <DetailProvider config={data}>
      <Flexbox gap={16}>
        <Header inModal />
        <Nav activeTab={activeTab as McpNavKey} inModal setActiveTab={setActiveTab} />
        <Flexbox gap={24}>
          {activeTab === McpNavKey.Overview && <Overview inModal />}
          {activeTab === McpNavKey.Deployment && <Deployment />}
          {activeTab === McpNavKey.Schema && <Schema />}
          {activeTab === McpNavKey.Score && <Score />}
        </Flexbox>
      </Flexbox>
    </DetailProvider>
  );
});

export default Detail;
