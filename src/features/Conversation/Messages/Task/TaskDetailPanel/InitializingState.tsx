'use client';

import { Flexbox } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding-block: 12px;
    padding-inline: 16px;
  `,
  progress: css`
    position: relative;

    overflow: hidden;

    height: 3px;
    border-radius: 2px;

    background: ${token.colorFillSecondary};
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

const InitializingState = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('chat');

  return (
    <Flexbox className={styles.container} gap={12}>
      {/* Status Row */}
      <Flexbox align="center" className={styles.statusRow} gap={8} horizontal>
        <Loader2 className={styles.spin} size={14} />
        <span className={styles.statusText}>
          {t('task.status.initializing', { defaultValue: 'Starting task...' })}
        </span>
      </Flexbox>

      {/* Progress Bar (indeterminate) */}
      <div className={styles.progress}>
        <div className={styles.progressShimmer} />
      </div>
    </Flexbox>
  );
});

InitializingState.displayName = 'InitializingState';

export default InitializingState;
