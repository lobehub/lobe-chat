'use client';

import { createStaticStyles, cssVar, Flexbox, Icon, Popover, Skeleton, Text } from '@lobehub/ui';
import { ChevronDownIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { formatSize } from '@/utils/format';

import { UsageBreakdown } from './UsageBreakdown';
import { useDriveUsage } from './useDriveData';

export { UsageBreakdown as DriveUsageBreakdown } from './UsageBreakdown';

const styles = createStaticStyles(({ css }) => ({
  // A track that reads as one even when nearly empty, and a fill that never
  // shrinks below a sliver — "almost nothing used" still shows as a start.
  meter: css`
    overflow: hidden;
    display: inline-flex;
    flex: none;

    width: 72px;
    height: 4px;
    border-radius: 2px;

    background: ${cssVar.colorFillSecondary};
  `,
  meterFill: css`
    min-width: 4px;
    height: 100%;
    border-radius: 2px;
  `,
  trigger: css`
    cursor: pointer;

    padding-block: 4px;
    padding-inline: 8px;
    border: none;
    border-radius: ${cssVar.borderRadius};

    background: none;

    &:hover {
      background: ${cssVar.colorFillTertiary};
    }

    &:focus-visible {
      outline: 2px solid ${cssVar.colorPrimaryBorder};
    }
  `,
}));

const percentOf = (bytes: number | null | undefined, quota: number) =>
  quota > 0 && bytes ? Math.min(100, (bytes / quota) * 100) : 0;

/**
 * How full the plan's storage is, as one compact meter in the page header.
 *
 * The storage page is for the folders on a drive; how much they hold is
 * second to that, so the figure takes a line's worth of room and the
 * breakdown — each drive, each member's for an admin, departed members'
 * drives — opens from it on demand. Over the quota it turns red, because then
 * the next write is refused and the figure stops being secondary.
 *
 * Read from what was last measured; measuring walks the volume, so it waits
 * for the refresh in the breakdown.
 */
const DriveUsage = memo(() => {
  const { t } = useTranslation('setting');
  const { data, error, isLoading, refresh } = useDriveUsage();

  if (error) return null;
  if (isLoading || !data) return <Skeleton.Text rows={1} width={160} />;

  const { quotaBytes, totalUsageBytes } = data;
  const isWorkspace = (data.drives ?? []).length > 1;
  const over = totalUsageBytes !== null && totalUsageBytes > quotaBytes;

  return (
    <Popover
      content={<UsageBreakdown inPopover data={data} onRefresh={refresh} />}
      placement={'bottomRight'}
      trigger={'click'}
    >
      <Flexbox
        horizontal
        align={'center'}
        aria-label={t(isWorkspace ? 'drive.usage.poolTitle' : 'drive.usage.title')}
        as={'button'}
        className={styles.trigger}
        gap={8}
      >
        <span className={styles.meter}>
          <span
            className={styles.meterFill}
            style={{
              background: over ? cssVar.colorError : cssVar.colorPrimary,
              width: `${percentOf(totalUsageBytes, quotaBytes)}%`,
            }}
          />
        </span>
        <Text fontSize={12} style={{ whiteSpace: 'nowrap' }} type={over ? 'danger' : 'secondary'}>
          {totalUsageBytes === null
            ? t('drive.usage.unmeasured', { total: formatSize(quotaBytes) })
            : t('drive.usage.used', {
                total: formatSize(quotaBytes),
                used: formatSize(totalUsageBytes),
              })}
        </Text>
        <Icon icon={ChevronDownIcon} size={12} style={{ color: cssVar.colorTextTertiary }} />
      </Flexbox>
    </Popover>
  );
});

DriveUsage.displayName = 'DriveUsage';

export default DriveUsage;

/**
 * The breakdown on its own, for a page that shows usage as a section of its
 * own — the billing usage page — rather than as a meter beside something else.
 * Nothing while loading or when there is no drive to break down.
 */
export const DriveUsageCard = memo(() => {
  const { data, error, refresh } = useDriveUsage();
  if (error || !data) return null;

  return <UsageBreakdown data={data} onRefresh={refresh} />;
});

DriveUsageCard.displayName = 'DriveUsageCard';
