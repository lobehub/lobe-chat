import { Icon, Tag, Tooltip } from '@lobehub/ui';
import { HistoryIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';

const SearchTag = memo(() => {
  const { t } = useTranslation('chat');
  const historyCount = useAgentStore(agentChatConfigSelectors.historyCount);

  return (
    <Flexbox height={22}>
      <Tooltip title={t('history.title', { count: historyCount })}>
        <Tag>
          <Icon icon={HistoryIcon} />
          <span>{historyCount}</span>
        </Tag>
      </Tooltip>
    </Flexbox>
  );
});

export default SearchTag;
