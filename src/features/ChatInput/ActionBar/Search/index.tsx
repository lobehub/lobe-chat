import { GlobeOffIcon } from '@lobehub/ui/icons';
import { useTheme } from 'antd-style';
import { Globe } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentEnableSearch } from '@/hooks/useAgentEnableSearch';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { agentChatConfigSelectors } from '@/store/agent/slices/chat';

import Action from '../components/Action';
import Controls from './Controls';

const Search = memo(() => {
  const { t } = useTranslation('chat');
  const [isLoading, mode, updateAgentChatConfig] = useAgentStore((s) => [
    agentSelectors.isAgentConfigLoading(s),
    agentChatConfigSelectors.agentSearchMode(s),
    s.updateAgentChatConfig,
  ]);
  const isAgentEnableSearch = useAgentEnableSearch();
  const theme = useTheme();
  const isMobile = useIsMobile();

  if (isLoading) return <Action disabled icon={GlobeOffIcon} />;

  return (
    <Action
      color={isAgentEnableSearch ? theme.colorInfo : undefined}
      icon={isAgentEnableSearch ? Globe : GlobeOffIcon}
      onClick={
        isMobile
          ? undefined
          : async (e) => {
              e?.preventDefault?.();
              e?.stopPropagation?.();
              const next = mode === 'off' ? 'auto' : 'off';
              await updateAgentChatConfig({ searchMode: next });
            }
      }
      popover={{
        content: <Controls />,
        maxWidth: 320,
        minWidth: 320,
        placement: 'topLeft',
        styles: {
          body: {
            padding: 4,
          },
        },
        trigger: isMobile ? ['click'] : ['hover'],
      }}
      showTooltip={false}
      title={t('search.title')}
    />
  );
});

Search.displayName = 'Search';

export default Search;
