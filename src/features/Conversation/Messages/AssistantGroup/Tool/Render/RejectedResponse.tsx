import { Flexbox, Icon } from '@lobehub/ui';
import { createStaticStyles, useTheme } from 'antd-style';
import { AlertTriangle } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const styles = createStaticStyles(({ css, cssVar }) => ({
  container: css`
    padding-block: 8px;
    padding-inline: 6px;
  `,
  reason: css`
    font-size: 12px;
    color: ${cssVar.colorTextTertiary};
  `,
  title: css`
    font-size: 14px;
    color: ${cssVar.colorTextSecondary};
  `,
}));

interface RejectedResponseProps {
  reason?: string;
}

const RejectedResponse = memo<RejectedResponseProps>(({ reason }) => {
  const { t } = useTranslation('chat');
  const theme = useTheme();

  return (
    <Flexbox className={styles.container} gap={8}>
      <Flexbox align={'center'} gap={8} horizontal>
        <Icon color={theme.colorWarning} icon={AlertTriangle} size={16} />
        <div className={styles.title}>
          {reason
            ? t('tool.intervention.rejectedWithReason', { reason })
            : t('tool.intervention.toolRejected')}
        </div>
      </Flexbox>
    </Flexbox>
  );
});

export default RejectedResponse;
