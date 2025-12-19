'use client';

import { TaskDetail } from '@lobechat/types';
import { createStyles } from 'antd-style';
import { Footprints, Timer, Wrench } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';

const useStyles = createStyles(({ css, token }) => ({
  footer: css`
    padding-block: 8px;
    padding-inline: 16px;
    border-block-start: 1px solid ${token.colorBorderSecondary};
  `,
  metricItem: css`
    display: flex;
    gap: 4px;
    align-items: center;

    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  metricValue: css`
    font-weight: 500;
    color: ${token.colorTextSecondary};
  `,
  progress: css`
    position: relative;

    overflow: hidden;

    height: 3px;
    margin-block: 12px;
    margin-inline: 16px;
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
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: ${token.colorTextQuaternary};
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
  statusIcon: css`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    width: 16px;
    height: 16px;
    border-radius: 50%;

    color: ${token.colorPrimaryText};

    background: ${token.colorPrimaryBg};
  `,
}));

interface ProcessingStateProps {
  /**
   * Message ID for updating task status in store
   */
  messageId: string;
  taskDetail: TaskDetail;
}

// Progress increases by 5% every 30 seconds, max 95%
const PROGRESS_INTERVAL = 30_000;
const PROGRESS_INCREMENT = 5;
const MAX_PROGRESS = 95;

// Format elapsed time as mm:ss or hh:mm:ss
const formatElapsedTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
};

const ProcessingState = memo<ProcessingStateProps>(({ taskDetail, messageId }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('chat');
  const [progress, setProgress] = useState(5);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Get polling hook and check if there's an active operation polling
  const [useEnablePollingTaskStatus, operations] = useChatStore((s) => [
    s.useEnablePollingTaskStatus,
    s.operations,
  ]);

  // Check if exec_async_task is already polling for this message
  const hasActiveOperationPolling = Object.values(operations).some(
    (op) =>
      op.status === 'running' &&
      op.type === 'execAgentRuntime' &&
      op.context?.messageId === messageId,
  );

  // Enable polling only when no active operation is already polling
  // This handles the case when user refreshes page and exec_async_task is no longer running
  useEnablePollingTaskStatus(taskDetail.threadId, messageId, !hasActiveOperationPolling);

  const { totalToolCalls, totalSteps, startedAt } = taskDetail;

  // Calculate initial progress and elapsed time based on startedAt
  useEffect(() => {
    if (startedAt) {
      const startTime = new Date(startedAt).getTime();
      const elapsed = Date.now() - startTime;
      const intervals = Math.floor(elapsed / PROGRESS_INTERVAL);
      const initialProgress = Math.min(5 + intervals * PROGRESS_INCREMENT, MAX_PROGRESS);
      setProgress(initialProgress);
      setElapsedTime(elapsed);
    }
  }, [startedAt]);

  // Timer for updating elapsed time every second
  useEffect(() => {
    if (!startedAt) return;

    const timer = setInterval(() => {
      const startTime = new Date(startedAt).getTime();
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt]);

  // Progress timer - increment every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => Math.min(prev + PROGRESS_INCREMENT, MAX_PROGRESS));
    }, PROGRESS_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const hasMetrics = totalSteps || totalToolCalls;

  return (
    <Flexbox>
      {/* Progress Bar */}
      <div className={styles.progress}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
        <div className={styles.progressShimmer} />
      </div>

      {/* Footer with metrics */}
      <Flexbox
        align="center"
        className={styles.footer}
        gap={12}
        horizontal
        justify={'space-between'}
        wrap="wrap"
      >
        <Flexbox align="center" gap={12} horizontal>
          {/* Elapsed Time */}
          {startedAt && (
            <div className={styles.metricItem}>
              <Timer size={12} />
              <span className={styles.metricValue}>{formatElapsedTime(elapsedTime)}</span>
            </div>
          )}
        </Flexbox>
        <Flexbox align="center" gap={12} horizontal>
          {/* Steps */}
          {totalSteps !== undefined && totalSteps > 0 && (
            <div className={styles.metricItem}>
              <Footprints size={12} />
              <span className={styles.metricValue}>{totalSteps}</span>
              <span>{t('task.metrics.stepsShort')}</span>
            </div>
          )}
          {/* Tool Calls */}
          {totalToolCalls !== undefined && totalToolCalls > 0 && (
            <>
              {hasMetrics && totalSteps !== undefined && totalSteps > 0 && (
                <div className={styles.separator} />
              )}
              <div className={styles.metricItem}>
                <Wrench size={12} />
                <span className={styles.metricValue}>{totalToolCalls}</span>
                <span>{t('task.metrics.toolCallsShort')}</span>
              </div>
            </>
          )}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

ProcessingState.displayName = 'ProcessingState';

export default ProcessingState;
