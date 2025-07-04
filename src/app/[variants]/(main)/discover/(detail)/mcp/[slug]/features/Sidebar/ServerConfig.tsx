import { usePathname } from 'next/navigation';
import qs from 'query-string';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { getRecommendedDeployment } from '@/features/MCP/utils';
import Platform from '@/features/MCPPluginDetail/Deployment/Platform';
import { useDetailContext } from '@/features/MCPPluginDetail/DetailProvider';
import { McpNavKey } from '@/types/discover';

import Title from '../../../../../features/Title';

const ServerConfig = memo(() => {
  const { t } = useTranslation('discover');
  const pathName = usePathname();
  const installLink = qs.stringifyUrl({
    query: {
      activeTab: McpNavKey.Deployment,
    },
    url: pathName,
  });
  const { deploymentOptions = [], identifier } = useDetailContext();
  const recommendedDeployment = getRecommendedDeployment(deploymentOptions);

  return (
    <Flexbox gap={16}>
      <Title more={t('mcp.details.sidebar.moreServerConfig')} moreLink={installLink}>
        {t('mcp.details.sidebar.serverConfig')}
      </Title>
      <Platform connection={recommendedDeployment?.connection} identifier={identifier} lite />
    </Flexbox>
  );
});

export default ServerConfig;
