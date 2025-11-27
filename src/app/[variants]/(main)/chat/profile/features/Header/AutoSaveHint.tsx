'use client';

import { Icon, Tag } from '@lobehub/ui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CloudIcon, Loader2Icon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/features/AgentSetting/store';

dayjs.extend(relativeTime);

/**
 * AutoSaveHint - Save status indicator for agent settings
 *
 * Displays real-time save status for all agent configuration changes
 * including Meta, Config, and prompt changes.
 */
const AutoSaveHint = memo(() => {
  const { t } = useTranslation('setting');
  const saveStatus = useStore((s) => s.saveStatus);
  const lastUpdatedTime = useStore((s) => s.lastUpdatedTime);

  const isSaving = saveStatus === 'saving';

  if (isSaving)
    return <Tag icon={<Icon icon={Loader2Icon} spin />}>{t('agentProfile.saving')}</Tag>;

  if (saveStatus === 'saved' && lastUpdatedTime)
    return (
      <Tag icon={<Icon icon={CloudIcon} />}>
        {t('agentProfile.saved')} {dayjs(lastUpdatedTime).fromNow()}
      </Tag>
    );

  return <Tag icon={<Icon icon={CloudIcon} />}>{t('agentProfile.latest')}</Tag>;
});

export default AutoSaveHint;
