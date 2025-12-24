import { ToolIntervention } from '@lobechat/types';
import { Block, Icon, Tooltip } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import {
  Ban,
  Check,
  HandIcon,
  Loader2Icon,
  PauseIcon,
  X,
} from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { LOADING_FLAT } from '@/const/message';

interface StatusIndicatorProps {
  intervention?: ToolIntervention;
  result?: { content: string | null; error?: any; state?: any };
}

const StatusIndicator = memo<StatusIndicatorProps>(({ intervention, result }) => {
  const { t } = useTranslation('chat');
  const theme = useTheme();

  const hasError = !!result?.error;
  const hasSuccessResult = !!result?.content && result.content !== LOADING_FLAT;
  const hasResult = hasSuccessResult || hasError;
  const isPending = intervention?.status === 'pending';
  const isReject = intervention?.status === 'rejected';
  const isAbort = intervention?.status === 'aborted';

  let icon;

  if (isAbort) {
    icon = (
      <Tooltip title={t('tool.intervention.toolAbort')}>
        <Icon color={theme.colorTextTertiary} icon={PauseIcon} />
      </Tooltip>
    );
  } else if (isReject) {
    icon = (
      <Tooltip title={t('tool.intervention.toolRejected')}>
        <Icon color={theme.colorTextTertiary} icon={Ban} />
      </Tooltip>
    );
  } else if (hasError) {
    icon = <Icon color={theme.colorError} icon={X} />;
  } else if (isPending) {
    icon = <Icon color={theme.colorInfo} icon={HandIcon} />;
  } else if (hasResult) {
    icon = <Icon color={theme.colorSuccess} icon={Check} />;
  } else {
    icon = <Icon color={theme.colorTextDescription} icon={Loader2Icon} spin />;
  }

  return (
    <Block
      align={'center'}
      flex={'none'}
      gap={4}
      height={24}
      horizontal
      justify={'center'}
      style={{
        fontSize: 12,
      }}
      variant={'outlined'}
      width={24}
    >
      {icon}
    </Block>
  );
});

export default StatusIndicator;
