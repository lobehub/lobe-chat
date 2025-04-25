import { ActionIcon } from '@lobehub/ui';
import { GlobOffIcon } from '@lobehub/ui/icons';
import { Globe } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isDeprecatedEdition } from '@/const/version';
import { useAgentEnableSearch } from '@/hooks/useAgentEnableSearch';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import ActionPopover from '../../components/ActionPopover';
import AINetworkSettings from './SwitchPanel';

const Search = memo(() => {
  const { t } = useTranslation('chat');
  const [loading, setLoading] = useState(false);
  const [isLoading] = useAgentStore((s) => [agentSelectors.isAgentConfigLoading(s)]);
  const isAgentEnableSearch = useAgentEnableSearch();

  if (isLoading) return <ActionIcon icon={GlobOffIcon} loading />;

  return (
    !isDeprecatedEdition && (
      <ActionPopover
        content={<AINetworkSettings setLoading={setLoading} />}
        maxWidth={320}
        minWidth={320}
        placement={'topLeft'}
        styles={{
          body: {
            padding: 4,
          },
        }}
      >
        <ActionIcon
          icon={isAgentEnableSearch ? Globe : GlobOffIcon}
          loading={loading}
          title={t('search.title')}
          tooltipProps={{
            placement: 'bottom',
          }}
        />
      </ActionPopover>
    )
  );
});

Search.displayName = 'Search';

export default Search;
