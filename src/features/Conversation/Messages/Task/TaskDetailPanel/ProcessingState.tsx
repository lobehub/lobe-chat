'use client';

import { createStyles } from 'antd-style';
import { Loader2, MessageSquare, Wrench } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { TaskDetail } from '@/types/index';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding-block: 12px;
padding-inline: 16px;
  `,
  metricItem: css`
    display: flex;
    gap: 4px;
    align-items: center;

    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
  metricValue: css`
    font-weight: 500;
    color: ${token.colorText};
  `,
  progress: css`
    position: relative;

    overflow: hidden;

    height: 3px;
    border-radius: 2px;

    background: ${token.colorFillSecondary};
  `,
  progressBar: css`
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;

    height: 100%;
    border-radius: 2px;

    background: linear-gradient(90deg, ${token.colorPrimary}, ${token.colorPrimaryHover});

    transition: width 0.5s ease-out;
  `,
  progressShimmer: css`
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;

    width: 100%;
    height: 100%;

    background: linear-gradient(90deg, transparent, ${token.colorPrimaryBgHover}, transparent);

    animation: shimmer 2s infinite;

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }

      100% {
        transform: translateX(100%);
      }
    }
  `,
  separator: css`
    width: 1px;
    height: 12px;
    background: ${token.colorBorderSecondary};
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
  statusRow: css`
    font-size: 13px;
    color: ${token.colorTextSecondary};
  `,
  statusText: css`
    font-weight: 500;
    color: ${token.colorText};
  `,
}));

interface ProcessingStateProps {
  taskDetail: TaskDetail;
}

// Progress increases by 5% every 30 seconds, max 95%
const PROGRESS_INTERVAL = 30_000;
const PROGRESS_INCREMENT = 5;
const MAX_PROGRESS = 95;

const ProcessingState = memo<ProcessingStateProps>(({ taskDetail }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('chat');
  const [progress, setProgress] = useState(5);

  const { totalToolCalls, totalMessages, startedAt } = taskDetail;

  // Calculate initial progress based on startedAt
  useEffect(() => {
    if (startedAt) {
      const startTime = new Date(startedAt).getTime();
      const elapsed = Date.now() - startTime;
      const intervals = Math.floor(elapsed / PROGRESS_INTERVAL);
      const initialProgress = Math.min(5 + intervals * PROGRESS_INCREMENT, MAX_PROGRESS);
      setProgress(initialProgress);
    }
  }, [startedAt]);

  // Progress timer - increment every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => Math.min(prev + PROGRESS_INCREMENT, MAX_PROGRESS));
    }, PROGRESS_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const hasMetrics = (totalToolCalls && totalToolCalls > 0) || (totalMessages && totalMessages > 0);

  return (
    <Flexbox className={styles.container} gap={12}>
      {/* Status Row */}
      <Flexbox align="center" className={styles.statusRow} gap={8} horizontal>
        <Loader2 className={styles.spin} size={14} />
        <span className={styles.statusText}>
          {t('task.status.processing', { defaultValue: 'Working...' })}
        </span>

        {hasMetrics && (
          <>
            <div className={styles.separator} />
            {totalToolCalls !== undefined && totalToolCalls > 0 && (
              <div className={styles.metricItem}>
                <Wrench size={12} />
                <span className={styles.metricValue}>{totalToolCalls}</span>
                <span>{t('task.metrics.toolCallsShort', { defaultValue: 'tools' })}</span>
              </div>
            )}
            {totalMessages !== undefined && totalMessages > 0 && (
              <div className={styles.metricItem}>
                <MessageSquare size={12} />
                <span className={styles.metricValue}>{totalMessages}</span>
                <span>{t('task.metrics.messagesShort', { defaultValue: 'messages' })}</span>
              </div>
            )}
          </>
        )}
      </Flexbox>

      {/* Progress Bar */}
      <div className={styles.progress}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
        <div className={styles.progressShimmer} />
      </div>
    </Flexbox>
  );
});

ProcessingState.displayName = 'ProcessingState';

export default ProcessingState;
