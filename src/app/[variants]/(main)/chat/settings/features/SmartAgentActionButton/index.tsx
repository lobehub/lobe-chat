import { Button } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { Loader2 } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentOwnershipCheck } from '@/hooks/useAgentOwnershipCheck';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

import SubmitAgentButton from '../SubmitAgentButton';
import UploadAgentVersionButton from '../UploadAgentVersionButton';

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
  const { isOwnAgent, error } = useAgentOwnershipCheck(meta?.marketIdentifier);

  const buttonType = useMemo(() => {
    if (!meta?.marketIdentifier) {
      // 没有 marketIdentifier，显示提交按钮
      return 'submit';
    }

    if (isOwnAgent === null) {
      // 正在检查所有权
      return 'loading';
    }

    if (isOwnAgent === true) {
      // 是用户的 agent，显示上传新版本
      return 'upload';
    }

    // 不是用户的 agent，显示提交按钮（fork 功能）
    return 'submit';
  }, [meta?.marketIdentifier, isOwnAgent]);

  console.log('[SmartAgentActionButton] Button type:', buttonType, {
    error,
    isOwnAgent,
    marketIdentifier: meta?.marketIdentifier,
  });

  switch (buttonType) {
    case 'upload': {
      return <UploadAgentVersionButton modal={modal} />;
    }

    case 'submit': {
      return <SubmitAgentButton modal={modal} />;
    }

    default: {
      // 加载中状态：显示禁用的按钮
      return modal ? (
        <Button block disabled icon={Loader2} loading variant={'filled'}>
          {t('checkingPermissions', { defaultValue: '检查权限中...' })}
        </Button>
      ) : (
        <Button disabled icon={Loader2} loading size="small" variant={'filled'}>
          {t('checking', { defaultValue: '检查中...' })}
        </Button>
      );
    }
  }
});

SmartAgentActionButton.displayName = 'SmartAgentActionButton';

export default SmartAgentActionButton;
