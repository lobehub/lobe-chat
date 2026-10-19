'use client';

import type { MeetingErrorCode } from '@lobechat/types';
import { Alert, Button, Flexbox } from '@lobehub/ui';
import { useTranslation } from 'react-i18next';

import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';

interface RefineErrorAlertProps {
  code: MeetingErrorCode;
  loading?: boolean;
  onRetry: () => void;
}

/** A failed refine pass: what went wrong, where to fix it, and a retry. */
const RefineErrorAlert = ({ code, loading, onRetry }: RefineErrorAlertProps) => {
  const { t } = useTranslation('meeting');
  const navigate = useWorkspaceAwareNavigate();
  const retryable = code !== 'audio_missing' && code !== 'audio_unsupported';

  return (
    <Alert
      data-testid="meeting-refine-error"
      description={t(`refine.error.${code}`)}
      title={t('refine.error.title')}
      type={'error'}
      action={
        <Flexbox horizontal gap={8}>
          {(code === 'provider_not_configured' || code === 'quota_exceeded') && (
            <Button size={'small'} onClick={() => navigate('/settings/service-model')}>
              {t('live.openSettings')}
            </Button>
          )}
          {retryable && (
            <Button loading={loading} size={'small'} type={'primary'} onClick={onRetry}>
              {t('refine.retry')}
            </Button>
          )}
        </Flexbox>
      }
    />
  );
};

export default RefineErrorAlert;
