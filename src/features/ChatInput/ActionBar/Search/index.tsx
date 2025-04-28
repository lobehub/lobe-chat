import { ActionIcon } from '@lobehub/ui';
import { GlobeOffIcon } from '@lobehub/ui/icons';
import { useTheme } from 'antd-style';
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
  const theme = useTheme();

  if (isLoading) return <ActionIcon disabled icon={GlobeOffIcon} />;

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
          color={isAgentEnableSearch ? theme.colorInfo : undefined}
          icon={isAgentEnableSearch ? Globe : GlobeOffIcon}
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
