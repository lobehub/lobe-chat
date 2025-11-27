import { ToolIntervention } from '@lobechat/types';
import { Icon, Tooltip } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Ban, Check, CircleStop, X } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

interface StatusIndicatorProps {
  intervention?: ToolIntervention;
  result?: { content: string | null; error?: any; state?: any };
}

const StatusIndicator = memo<StatusIndicatorProps>(({ intervention, result }) => {
  const { t } = useTranslation('chat');
  const theme = useTheme();

  const hasError = !!result?.error;
  const isReject = intervention?.status === 'rejected';
  const isAbort = intervention?.status === 'aborted';

  return (
    <Flexbox align={'center'} gap={4} horizontal style={{ fontSize: 12 }}>
      {isAbort ? (
        <Tooltip title={t('tool.intervention.toolAbort')}>
          <Icon color={theme.colorTextTertiary} icon={CircleStop} />
        </Tooltip>
      ) : isReject ? (
        <Tooltip title={t('tool.intervention.toolRejected')}>
          <Icon color={theme.colorTextTertiary} icon={Ban} />
        </Tooltip>
      ) : hasError ? (
        <Icon color={theme.colorError} icon={X} />
      ) : (
        <Icon color={theme.colorSuccess} icon={Check} />
      )}
    </Flexbox>
  );
});

export default StatusIndicator;
