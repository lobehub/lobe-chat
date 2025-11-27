import { Button } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { Loader2 } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentOwnershipCheck } from '@/hooks/useAgentOwnershipCheck';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import MarketPublishButton from './MarketPublishButton';

const AgentPublishButton = memo(() => {
  const { t } = useTranslation('setting');
  const meta = useAgentStore(agentSelectors.currentAgentMeta, isEqual);
  const { isOwnAgent } = useAgentOwnershipCheck(meta?.marketIdentifier);

  const buttonType = useMemo(() => {
    if (!meta?.marketIdentifier) {
      return 'submit';
    }

    if (isOwnAgent === null) {
      return 'loading';
    }

    if (isOwnAgent === true) {
      return 'upload';
    }

    return 'submit';
  }, [meta?.marketIdentifier, isOwnAgent]);

  switch (buttonType) {
    case 'upload': {
      return <MarketPublishButton action="upload" marketIdentifier={meta?.marketIdentifier} />;
    }

    case 'submit': {
      return <MarketPublishButton action="submit" marketIdentifier={meta?.marketIdentifier} />;
    }

    default: {
      return (
        <Button disabled icon={Loader2} loading variant={'filled'}>
          {t('checkingPermissions')}
        </Button>
      );
    }
  }
});

export default AgentPublishButton;
