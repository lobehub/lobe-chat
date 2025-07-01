import { Empty } from 'antd';
import { useTheme } from 'antd-style';
import { memo, useState } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import Deployment from '@/features/MCPPluginDetail/Deployment';
import { DetailProvider } from '@/features/MCPPluginDetail/DetailProvider';
import Header from '@/features/MCPPluginDetail/Header';
import Nav from '@/features/MCPPluginDetail/Nav';
import Overview from '@/features/MCPPluginDetail/Overview';
import Schema from '@/features/MCPPluginDetail/Schema';
import Score from '@/features/MCPPluginDetail/Score';
import Settings from '@/features/MCPPluginDetail/Settings';
import { useDiscoverStore } from '@/store/discover';
import { useToolStore } from '@/store/tool';
import { McpNavKey } from '@/types/discover';

import DetailsLoading from './Loading';

interface DetailProps {
  identifier?: string;
}
const Detail = memo<DetailProps>(({ identifier: defaultIdentifier }) => {
  const [activeTab, setActiveTab] = useState(McpNavKey.Overview);

  const theme = useTheme();
  const [activeMCPIdentifier] = useToolStore((s) => [s.activeMCPIdentifier]);

  const identifier = defaultIdentifier ?? activeMCPIdentifier;

  const useMcpDetail = useDiscoverStore((s) => s.useFetchMcpDetail);
  const { data, isLoading } = useMcpDetail({ identifier });

  if (!identifier)
    return (
      <Center
        height={'100%'}
        style={{
          background: theme.colorBgContainerSecondary,
        }}
        width={'100%'}
      >
        <Empty description={'选择插件以预览详细信息'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Center>
    );

  if (isLoading) return <DetailsLoading />;

  return (
    <DetailProvider config={data}>
      <Flexbox gap={16}>
        <Header inModal />
        <Nav activeTab={activeTab as McpNavKey} inModal setActiveTab={setActiveTab} />
        <Flexbox gap={24}>
          {activeTab === McpNavKey.Settings && <Settings />}
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
