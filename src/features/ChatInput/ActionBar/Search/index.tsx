import { ActionIcon } from '@lobehub/ui';
import { Popover } from 'antd';
import { useTheme } from 'antd-style';
import { Globe } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { aiModelSelectors, aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';

import AINetworkSettings from './SwitchPanel';

const Search = memo(() => {
  const { t } = useTranslation('chat');
  const [isLoading, isAgentEnableSearch] = useAgentStore((s) => [
    agentSelectors.isAgentConfigLoading(s),
    agentSelectors.isAgentEnableSearch(s),
  ]);
  const [model, provider] = useAgentStore((s) => [
    agentSelectors.currentAgentModel(s),
    agentSelectors.currentAgentModelProvider(s),
  ]);

  const [isModelHasBuiltinSearch] = useAiInfraStore((s) => [
    aiModelSelectors.isModelHasBuiltinSearchConfig(model, provider)(s),
    aiProviderSelectors.isProviderHasBuiltinSearchConfig(provider)(s),
  ]);

  const isMobile = useIsMobile();

  const theme = useTheme();
  if (isLoading) return null;
  // <ActionIcon
  //   icon={Globe}
  //   placement={'bottom'}
  //   style={{
  //     cursor: 'not-allowed',
  //   }}
  // />

  return (
    isModelHasBuiltinSearch && (
      <Flexbox>
        <Popover
          arrow={false}
          content={<AINetworkSettings />}
          styles={{
            body: {
              minWidth: isMobile ? undefined : 200,
              padding: 4,
              width: isMobile ? '100vw' : undefined,
            },
          }}
        >
          <ActionIcon
            color={
              isAgentEnableSearch ? (theme.isDarkMode ? theme.cyan7 : theme.cyan10) : undefined
            }
            icon={Globe}
            placement={'bottom'}
            title={t('search.title')}
          />
        </Popover>
      </Flexbox>
    )
  );
});

Search.displayName = 'Search';

export default Search;
