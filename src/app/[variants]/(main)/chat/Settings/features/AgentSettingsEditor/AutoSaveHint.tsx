'use client';

import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Loader2Icon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useStore } from '@/features/AgentSetting/store';

dayjs.extend(relativeTime);

/**
 * AutoSaveHint - Save status indicator for agent settings
 *
 * Displays real-time save status for all agent configuration changes
 * including Meta, Config, and prompt changes.
 */
const AutoSaveHint = memo(() => {
  const theme = useTheme();
  const saveStatus = useStore((s) => s.saveStatus);
  const lastUpdatedTime = useStore((s) => s.lastUpdatedTime);

  if (saveStatus === 'idle') return null;

  return (
    <Flexbox align="center" direction="horizontal" gap={6}>
      {saveStatus === 'saving' && (
        <>
          <Icon icon={Loader2Icon} spin />
          <span style={{ color: theme.colorTextTertiary, fontSize: 12 }}>Saving...</span>
        </>
      )}
      {saveStatus === 'saved' && lastUpdatedTime && (
        <span
          style={{
            color: theme.colorTextTertiary,
            fontSize: 12,
            whiteSpace: 'nowrap',
          }}
        >
          Saved {dayjs(lastUpdatedTime).fromNow()}
        </span>
      )}
    </Flexbox>
  );
});

export default AutoSaveHint;
