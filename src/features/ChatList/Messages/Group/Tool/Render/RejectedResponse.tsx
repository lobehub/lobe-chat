import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { AlertTriangle } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding-block: 8px;
    padding-inline: 6px;
  `,
  reason: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  title: css`
    font-size: 14px;
    color: ${token.colorTextSecondary};
  `,
}));

interface RejectedResponseProps {
  reason?: string;
}

const RejectedResponse = memo<RejectedResponseProps>(({ reason }) => {
  const { t } = useTranslation('chat');
  const { styles, theme } = useStyles();

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
