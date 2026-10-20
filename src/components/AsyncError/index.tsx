'use client';

import { Button, Center, createStaticStyles, cssVar, Flexbox, Icon, Text } from '@lobehub/ui';
import { RotateCwIcon, TriangleAlertIcon } from 'lucide-react';
import { memo, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { normalizeAsyncError } from '@/libs/swr/normalizeError';

/**
 * The error counterpart to the loading family (`Spin`,
 * `SkeletonLoading`, …). One reusable component, several `variant`s so different
 * surfaces express failure differently without each re-implementing the
 * icon + reason + retry plumbing. Pick the variant by where the failure lives;
 * the judgment (status → copy, retryable → show/hide Retry) stays here.
 *
 * - `page`   — full detail page / whole surface: centered hero + Reload.
 * - `block`  — a card / settings tab / widget: bordered block + Reload.
 * - `inline` — a list row / small slot: single line + retry link. An explicit
 *              `description` (what to do next) follows the title on the same
 *              line; raw technical detail (provider message, error code) goes
 *              in `details`, folded behind a "Show details" toggle.
 * - `metric` — a stat / aggregate slot: a **failed** marker where a number
 *              would sit, so an errored fetch never reads as a confident `$0`.
 */
export type AsyncErrorVariant = 'page' | 'block' | 'inline' | 'metric';

export interface AsyncErrorProps {
  /**
   * Custom action rendered in the retry button's slot — for terminal errors
   * where retrying can never succeed but the user still needs a way out
   * (e.g. a Back button on a 403).
   */
  action?: ReactNode;
  /** Override the auto-derived description (status-based copy otherwise). */
  description?: ReactNode;
  /**
   * `inline` only: raw technical detail (provider message, error code), hidden
   * until the user expands it.
   */
  details?: ReactNode;
  /** The thrown error; normalized for status-specific copy + retryable gating. */
  error?: unknown;
  /** `inline` only: center the line (list slots) or start-align it (rows, cards). */
  justify?: 'center' | 'start';
  /** Retry the same request (SWR `mutate` / query refetch). Hidden if absent. */
  onRetry?: () => void;
  /** Whether an explicit Retry action is currently in flight. */
  retrying?: boolean;
  /** Override the default title copy. */
  title?: ReactNode;
  variant?: AsyncErrorVariant;
}

const styles = createStaticStyles(({ css }) => ({
  block: css`
    width: 100%;
    min-height: 180px;
    padding: 32px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};

    background: ${cssVar.colorBgContainer};
  `,
  icon: css`
    color: ${cssVar.colorTextTertiary};
  `,
  details: css`
    overflow: auto;

    max-height: 160px;
    margin: 0;

    font-family: ${cssVar.fontFamilyCode};
    font-size: 12px;
    color: ${cssVar.colorTextTertiary};
    word-break: break-word;
    white-space: pre-wrap;
  `,
  inline: css`
    padding-block: 8px;
  `,
  metric: css`
    color: ${cssVar.colorTextQuaternary};
  `,
  page: css`
    flex: 1;
    width: 100%;
    min-height: 320px;
    padding: 48px;
  `,
}));

const RetryLink = ({ onRetry, retrying }: { onRetry?: () => void; retrying: boolean }) => {
  const { t } = useTranslation('error');

  return (
    <Button disabled={retrying} loading={retrying} size={'small'} type={'text'} onClick={onRetry}>
      {t('error.retry')}
    </Button>
  );
};

interface InlineErrorProps {
  action?: ReactNode;
  description?: ReactNode;
  details?: ReactNode;
  heading: ReactNode;
  justify: 'center' | 'start';
}

const InlineError = ({ action, description, details, heading, justify }: InlineErrorProps) => {
  const { t } = useTranslation('error');
  const [expanded, setExpanded] = useState(false);
  const hasDetails = details !== undefined && details !== null && details !== '';

  return (
    <Flexbox className={styles.inline} gap={4}>
      <Flexbox horizontal align={'center'} gap={8} justify={justify} wrap={'wrap'}>
        <Icon className={styles.icon} icon={TriangleAlertIcon} size={14} />
        <Text color={cssVar.colorTextSecondary} fontSize={13}>
          {heading}
        </Text>
        {description && (
          <Text color={cssVar.colorTextTertiary} fontSize={13}>
            {description}
          </Text>
        )}
        {action}
        {hasDetails && (
          <Button
            aria-expanded={expanded}
            size={'small'}
            type={'text'}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? t('asyncState.hideDetails') : t('asyncState.showDetails')}
          </Button>
        )}
      </Flexbox>
      {hasDetails && expanded && <pre className={styles.details}>{details}</pre>}
    </Flexbox>
  );
};

const AsyncError = memo<AsyncErrorProps>(
  ({
    variant = 'block',
    error,
    onRetry,
    retrying = false,
    title,
    description,
    details,
    justify = 'center',
    action,
  }) => {
    const { t } = useTranslation('error');
    const { status, retryable } = normalizeAsyncError(error);

    // Status-specific copy when we recovered a status, else the generic reason.
    const reason =
      description ??
      (status ? t(`response.${status}` as any, t('asyncState.desc')) : t('asyncState.desc'));
    const heading = title ?? t('asyncState.title');
    const showRetry = !!onRetry && retryable;

    // ─── metric: a failed marker where a number would render (never a fake $0) ───
    if (variant === 'metric') {
      return (
        <Flexbox horizontal align={'center'} className={styles.metric} gap={6}>
          <Icon icon={TriangleAlertIcon} size={14} />
          <Text color={cssVar.colorTextQuaternary} fontSize={13}>
            {t('asyncState.metricLabel')}
          </Text>
          {showRetry && (
            <Button
              disabled={retrying}
              loading={retrying}
              size={'small'}
              type={'text'}
              onClick={onRetry}
            >
              {t('error.retry')}
            </Button>
          )}
        </Flexbox>
      );
    }

    // ─── inline: single-line row failure with a retry link ───
    if (variant === 'inline') {
      return (
        <InlineError
          action={action ?? (showRetry && <RetryLink retrying={retrying} onRetry={onRetry} />)}
          description={description}
          details={details}
          heading={heading}
          justify={justify}
        />
      );
    }

    // ─── page / block: centered hero, sized by variant ───
    return (
      <Center className={variant === 'page' ? styles.page : styles.block} gap={12}>
        <Icon
          className={styles.icon}
          icon={TriangleAlertIcon}
          size={variant === 'page' ? 32 : 24}
        />
        <Flexbox align={'center'} gap={4}>
          <Text fontSize={variant === 'page' ? 16 : 15} weight={600}>
            {heading}
          </Text>
          <Text
            align={'center'}
            color={cssVar.colorTextTertiary}
            fontSize={13}
            style={{ maxWidth: 360 }}
          >
            {reason}
          </Text>
        </Flexbox>
        {action ??
          (showRetry && (
            <Button
              disabled={retrying}
              icon={<Icon icon={RotateCwIcon} />}
              loading={retrying}
              size={'small'}
              onClick={onRetry}
            >
              {t('error.retry')}
            </Button>
          ))}
      </Center>
    );
  },
);

AsyncError.displayName = 'AsyncError';

export default AsyncError;
