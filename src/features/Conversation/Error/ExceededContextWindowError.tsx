import { Button, Icon } from '@lobehub/ui';
import { Minimize2 } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/hooks/usePermission';
import { useChatStore } from '@/store/chat';

import { useConversationStore } from '../store';
import BaseErrorForm from './BaseErrorForm';
import { useRetryParentMessage } from './useRetryParentMessage';

/**
 * Copy for the failure that compaction recovers from. Both an over-long history and an
 * oversized request body (e.g. many large images inlined by the provider) shrink once the
 * history is summarized into text, so they share the compact-and-retry action.
 */
const COPY = {
  exceededContext: {
    desc: 'exceededContext.desc',
    title: 'exceededContext.title',
  },
  requestBodyTooLarge: {
    desc: 'requestBodyTooLarge.desc',
    title: 'requestBodyTooLarge.title',
  },
} as const;

interface ExceededContextWindowErrorProps {
  id: string;
  reason?: keyof typeof COPY;
}

const ExceededContextWindowError = memo<ExceededContextWindowErrorProps>(
  ({ id, reason = 'exceededContext' }) => {
    const { t } = useTranslation('error');
    const { allowed: canCreate } = usePermission('create_content');

    const context = useConversationStore((s) => s.context);
    const { disabled, loading, parentId, retryParentMessage } = useRetryParentMessage(id);

    const handleCompact = useCallback(async () => {
      if (!canCreate || !context.topicId) return;

      // Leave the failed turn out of the summary so it can be regenerated afterwards.
      await retryParentMessage(() =>
        useChatStore.getState().executeCompression(context, '', { beforeMessageId: parentId }),
      );
    }, [canCreate, context, parentId, retryParentMessage]);

    return (
      <BaseErrorForm
        avatar={<Icon icon={Minimize2} size={24} />}
        desc={t(COPY[reason].desc)}
        title={t(COPY[reason].title)}
        action={
          <Button
            disabled={!canCreate || !context.topicId || disabled}
            loading={loading}
            type={'primary'}
            onClick={handleCompact}
          >
            {t('exceededContext.compact')}
          </Button>
        }
      />
    );
  },
);

export default ExceededContextWindowError;
