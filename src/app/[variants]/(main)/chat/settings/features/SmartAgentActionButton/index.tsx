import { Button } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { Loader2 } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentOwnershipCheck } from '@/hooks/useAgentOwnershipCheck';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

import MarketPublishButton from './MarketPublishButton';

interface SmartAgentActionButtonProps {
  modal?: boolean;
}

/**
 * 智能Agent操作按钮组件
 * 根据Agent的所有权自动决定显示"提交新Agent"还是"上传新版本"按钮
 */
const SmartAgentActionButton = memo<SmartAgentActionButtonProps>(({ modal }) => {
  const { t } = useTranslation('setting');
  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);
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
      return (
        <MarketPublishButton
          action="upload"
          marketIdentifier={meta?.marketIdentifier}
          modal={modal}
        />
      );
    }

    case 'submit': {
      return (
        <MarketPublishButton
          action="submit"
          marketIdentifier={meta?.marketIdentifier}
          modal={modal}
        />
      );
    }

    default: {
      return (
        <Button block={Boolean(modal)} disabled icon={Loader2} loading variant={'filled'}>
          {t('checkingPermissions')}
        </Button>
      );
    }
  }
});

SmartAgentActionButton.displayName = 'SmartAgentActionButton';

export default SmartAgentActionButton;
