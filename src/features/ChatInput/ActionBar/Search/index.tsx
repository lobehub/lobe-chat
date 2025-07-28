import { GlobeOffIcon } from '@lobehub/ui/icons';
import { useTheme } from 'antd-style';
import { Globe } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { isDeprecatedEdition } from '@/const/version';
import { useAgentEnableSearch } from '@/hooks/useAgentEnableSearch';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import Action from '../components/Action';
import Controls from './Controls';

const Search = memo(() => {
  const { t } = useTranslation('chat');
  const [isLoading] = useAgentStore((s) => [agentSelectors.isAgentConfigLoading(s)]);
  const isAgentEnableSearch = useAgentEnableSearch();
  const theme = useTheme();

  if (isDeprecatedEdition) return null;
  if (isLoading) return <Action disabled icon={GlobeOffIcon} />;

  return (
    <Action
      color={isAgentEnableSearch ? theme.colorInfo : undefined}
      icon={isAgentEnableSearch ? Globe : GlobeOffIcon}
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
      }}
      showTooltip={false}
      title={t('search.title')}
    />
  );
});

Search.displayName = 'Search';

export default Search;
