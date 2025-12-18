'use client';

import { BuiltinRenderProps } from '@lobechat/types';
import { Tag, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Ban, CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { ExecuteTaskParams, ExecuteTaskState, ExecuteTaskStatus } from '../../../types';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 12px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillQuaternary};
  `,
  errorContent: css`
    padding-block: 8px;
    padding-inline: 12px;
    border-radius: ${token.borderRadius}px;

    font-size: 13px;
    color: ${token.colorError};

    background: ${token.colorErrorBg};
  `,
  metaItem: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  metaLabel: css`
    color: ${token.colorTextQuaternary};
  `,
  metaValue: css`
    font-family: ${token.fontFamilyCode};
  `,
  resultContent: css`
    padding-block: 8px;
    padding-inline: 12px;
    border-radius: ${token.borderRadius}px;

    font-size: 13px;

    background: ${token.colorFillTertiary};
  `,
  spin: css`
    animation: spin 1s linear infinite;

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }
    }
  `,
  taskContent: css`
    font-size: 13px;
    line-height: 1.5;
    color: ${token.colorTextSecondary};
  `,
}));

interface StatusConfig {
  color: 'blue' | 'green' | 'red' | 'orange' | 'default';
  icon: ReactNode;
  text: string;
}

const getStatusConfig = (status: ExecuteTaskStatus): StatusConfig => {
  const configs: Record<ExecuteTaskStatus, StatusConfig> = {
    cancelled: { color: 'orange', icon: <Ban size={14} />, text: 'Cancelled' },
    completed: { color: 'green', icon: <CheckCircle2 size={14} />, text: 'Completed' },
    failed: { color: 'red', icon: <XCircle size={14} />, text: 'Failed' },
    interrupted: { color: 'orange', icon: <Ban size={14} />, text: 'Interrupted' },
    processing: { color: 'blue', icon: <Loader2 className="spin" size={14} />, text: 'Processing' },
    timeout: { color: 'orange', icon: <Clock size={14} />, text: 'Timeout' },
  };
  return configs[status] || configs.processing;
};

interface StatusIndicatorProps {
  status: ExecuteTaskStatus;
}

const StatusIndicator = memo<StatusIndicatorProps>(({ status }) => {
  const { styles } = useStyles();
  const config = getStatusConfig(status);

  return (
    <Tag
      bordered={false}
      className={status === 'processing' ? styles.spin : undefined}
      color={config.color}
      icon={config.icon}
    >
      {config.text}
    </Tag>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

interface MetaInfoProps {
  cost?: { total: number };
  stepCount?: number;
  threadId?: string;
  usage?: { total_tokens?: number };
}

const MetaInfo = memo<MetaInfoProps>(({ threadId, stepCount, usage, cost }) => {
  const { styles, cx } = useStyles();

  return (
    <Flexbox gap={12} horizontal wrap="wrap">
      {threadId && (
        <Typography.Text
          className={styles.metaItem}
          copyable={{ text: threadId, tooltips: ['Copy Thread ID', 'Copied!'] }}
        >
          <span className={styles.metaLabel}>Thread: </span>
          <span className={styles.metaValue}>{threadId.slice(0, 8)}...</span>
        </Typography.Text>
      )}
      {typeof stepCount === 'number' && (
        <span className={cx(styles.metaItem)}>
          <span className={styles.metaLabel}>Steps: </span>
          <span className={styles.metaValue}>{stepCount}</span>
        </span>
      )}
      {usage?.total_tokens && (
        <span className={cx(styles.metaItem)}>
          <span className={styles.metaLabel}>Tokens: </span>
          <span className={styles.metaValue}>{usage.total_tokens.toLocaleString()}</span>
        </span>
      )}
      {cost?.total && (
        <span className={cx(styles.metaItem)}>
          <span className={styles.metaLabel}>Cost: </span>
          <span className={styles.metaValue}>${cost.total.toFixed(4)}</span>
        </span>
      )}
    </Flexbox>
  );
});

MetaInfo.displayName = 'MetaInfo';

/**
 * ExecuteTask Render component for Group Management tool
 * Displays the status and result of a task execution
 */
const ExecuteTaskRender = memo<BuiltinRenderProps<ExecuteTaskParams, ExecuteTaskState>>(
  ({ args, pluginState, content }) => {
    const { styles } = useStyles();

    const status = pluginState?.status || 'processing';
    const threadId = pluginState?.threadId;
    const isError = status === 'failed' || status === 'cancelled' || status === 'timeout';

    return (
      <Flexbox className={styles.container} gap={12}>
        {/* Status indicator */}
        <Flexbox align="center" gap={8} horizontal justify="space-between">
          <StatusIndicator status={status} />
          <MetaInfo
            cost={pluginState?.cost}
            stepCount={pluginState?.stepCount}
            threadId={threadId}
            usage={pluginState?.usage}
          />
        </Flexbox>

        {/* Task content */}
        {args?.task && (
          <Typography.Paragraph className={styles.taskContent} ellipsis={{ rows: 2 }}>
            {args.task}
          </Typography.Paragraph>
        )}

        {/* Result content */}
        {status === 'completed' && content && (
          <div className={styles.resultContent}>
            <Typography.Paragraph style={{ margin: 0 }}>{content}</Typography.Paragraph>
          </div>
        )}

        {/* Error content */}
        {isError && (pluginState?.error || content) && (
          <div className={styles.errorContent}>{pluginState?.error || content}</div>
        )}
      </Flexbox>
    );
  },
);

ExecuteTaskRender.displayName = 'ExecuteTaskRender';

export default ExecuteTaskRender;
